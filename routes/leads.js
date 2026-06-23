const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

function clean(value) {
    return String(value || '').trim();
}

function buildEmailHtml(data) {
    return `
    <div style="font-family: Arial, sans-serif; color: #152033; line-height: 1.5;">
      <h2>Nova cotação - Via Sovrana</h2>

      <p><strong>Nome:</strong> ${clean(data.nome)}</p>
      <p><strong>Empresa:</strong> ${clean(data.empresa)}</p>
      <p><strong>WhatsApp:</strong> ${clean(data.whatsapp)}</p>
      <p><strong>E-mail:</strong> ${clean(data.email)}</p>

      <hr>

      <p><strong>Origem:</strong> ${clean(data.origem)}</p>
      <p><strong>Destino:</strong> ${clean(data.destino)}</p>
      <p><strong>Tipo de carga:</strong> ${clean(data.carga)}</p>
      <p><strong>Prazo desejado:</strong> ${clean(data.prazo)}</p>
      <p><strong>Peso aproximado:</strong> ${clean(data.peso)} kg</p>
      <p><strong>Observações:</strong><br>${clean(data.observacoes)}</p>

      <hr>

      <p style="font-size: 12px; color: #657084;">
        Lead recebido pelo formulário do site viasovrana.com.br
      </p>
    </div>
  `;
}

function buildEmailText(data) {
    return `
Nova cotação - Via Sovrana

Nome: ${clean(data.nome)}
Empresa: ${clean(data.empresa)}
WhatsApp: ${clean(data.whatsapp)}
E-mail: ${clean(data.email)}

Origem: ${clean(data.origem)}
Destino: ${clean(data.destino)}
Tipo de carga: ${clean(data.carga)}
Prazo desejado: ${clean(data.prazo)}
Peso aproximado: ${clean(data.peso)} kg
Observações: ${clean(data.observacoes)}

Lead recebido pelo formulário do site viasovrana.com.br
  `;
}

async function verifyTurnstile(token, remoteIp) {
    if (!token) {
        return false;
    }

    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);

    if (remoteIp) {
        formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();

    return Boolean(result.success);
}

router.post('/site-cotacao', async (req, res, next) => {
    try {
        const data = req.body || {};

        const turnstileToken = data['cf-turnstile-response'];

        const remoteIp =
            req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.ip;

        const captchaOk = await verifyTurnstile(turnstileToken, remoteIp);

        if (!captchaOk) {
            return res.status(400).json({
                ok: false,
                message: 'Validação de segurança não concluída. Atualize a página e tente novamente.'
            });
        }

        const nome = clean(data.nome);
        const whatsapp = clean(data.whatsapp);
        const origem = clean(data.origem);
        const destino = clean(data.destino);

        if (!nome || !whatsapp || !origem || !destino) {
            return res.status(400).json({
                ok: false,
                message: 'Preencha nome, WhatsApp, origem e destino.'
            });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 465),
            secure: String(process.env.SMTP_SECURE) === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `"Via Sovrana" <${process.env.SMTP_USER}>`,
            to: process.env.LEAD_TO_EMAIL,
            replyTo: clean(data.email) || process.env.SMTP_USER,
            subject: `Nova cotação Via Sovrana - ${origem} para ${destino}`,
            text: buildEmailText(data),
            html: buildEmailHtml(data)
        });

        res.json({
            ok: true,
            message: 'Cotação enviada com sucesso.'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;