/**
 * Zona de entrega em São Paulo.
 */
class Zone {
  /** @param {string} key  @param {string} label  @param {number} taxa */
  constructor(key, label, taxa) {
    this.key   = key;
    this.label = label;
    this.taxa  = taxa;
  }
}

module.exports = Zone;
