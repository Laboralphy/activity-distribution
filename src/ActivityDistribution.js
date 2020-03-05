/**
 * Cette classe distribut des activité en font des entrées et des poids
 */
class ActivityDistribution {

    constructor() {
        this._entries = [];
        this._nSlotCount = 0;
        this._nEntryCount = 0;
    }

    get entries() {
        return this._entries;
    }

    /**
     * Defini le nombre d'entry parmis lesquelles il faut distribuer les activités
     * @param nCount {number}
     */
    setEntryCount(nCount) {
        this._entries = new Array(nCount);
        for (let i = 0; i < nCount; ++i) {
            this._entries[i] = {
                id: null,
                slots: [],
                weight: 0,
                counter: 0
            };
        }
        this._nEntryCount = nCount;
    }

    setEntries(data, nSlotCount) {
        this.setEntryCount(data.length);
        this.setSlotCount(nSlotCount);
        data.forEach(({id, weight}, iEntry) => {
            const e = this._entries[iEntry];
            e.id = id;
            e.weight = weight;
        });
        this.feed((iEntry, iSlot) => {
            const oDataEntry = data[iEntry];
            const {disable} = oDataEntry;
            const value = 0;
            const enabled = !disable.includes(iSlot);
            return {
                value, enabled
            };
        });
    }

    /**
     * Défini le nombre de slot que chaque entry comporte
     * @param nCount {number}
     */
    setSlotCount(nCount) {
        for (let i = 0, l = this._entries.length; i < l; ++i) {
            const slots = [];
            for (let iSlot = 0; iSlot < nCount; ++iSlot) {
                slots[iSlot] = {
                    value: 0,
                    enabled: true
                }
            }
            this._entries[i].slots = slots;
        }
        this._nSlotCount = nCount;
    }

    getSlotCount() {
        return this._nSlotCount;
    }

    getEntryCount() {
        return this._nEntryCount;
    }

    /**
     * Renvoie true si l'entrée dont l'index est spécifié, existe
     * @param iEntry {number}
     * @returns {boolean}
     */
    isEntryExists(iEntry) {
        return iEntry >= 0 && iEntry < this._entries.length;
    }

    /**
     * Renvoie true si le slot de l'entrée spécifiée, existe
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     * @returns {boolean}
     */
    isSlotExists(iEntry, iSlot) {
        return this.isEntryExists(iEntry) && iSlot >= 0 && iSlot < this._entries[iEntry].slots.length;
    }

    /**
     * Si l'entrée/Slot n'existe pas, une erreur survient
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     * @throws RangeError
     */
    checkSlot(iEntry, iSlot) {
        if (!this.isSlotExists(iEntry, iSlot)) {
            throw new RangeError('this entry/slot does not exists : entry:' + iEntry + ' slot:' + iSlot);
        }
    }

    getEntrySlot(iEntry, iSlot) {
        this.checkSlot(iEntry, iSlot);
        return this._entries[iEntry].slots[iSlot];
    }

    /**
     * Active un slot, ce slot pourra etre marké
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     */
    enableSlot(iEntry, iSlot) {
        this.getEntrySlot(iEntry, iSlot).enabled = true;
    }

    /**
     * Désctive un slot, ce slot ne pourra plus etre marké
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     */
    disableSlot(iEntry, iSlot) {
        this.getEntrySlot(iEntry, iSlot).enabled = false;
    }

    /**
     * Marque le slot spécifié
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     * @param value {number} nouvelle valuer
     */
    setSlotValue(iEntry, iSlot, value) {
        this.getEntrySlot(iEntry, iSlot).value = value;
    }

    /**
     * Efface le slot spécifié
     * @param iEntry {number} index de l'entrée
     * @param iSlot {number} index du slot
     */
    clearSlot(iEntry, iSlot) {
        this.getEntrySlot(iEntry, iSlot).value = 0;
    }

    getSlotValue(iEntry, iSlot) {
        return this.getEntrySlot(iEntry, iSlot).value;
    }

    /**
     * Rempli la grille de slot grace à la fonction spécifé
     * @param f {function}
     */
    feed(f) {
        const entries = this._entries;
        for (let iEntry = 0, nEntryCount = entries.length; iEntry < nEntryCount; ++iEntry) {
            const entry = entries[iEntry];
            for (let iSlot = 0, nSlotCount = entry.slots.length; iSlot < nSlotCount; ++iSlot) {
                const slot = entry.slots[iSlot];
                const {enabled, value} = f(iEntry, iSlot);
                slot.enabled = enabled;
                slot.value = value;
            }
        }
    }

    /**
     * pour l'index de slot donné, renvoie une colone de slot
     * @param iSlot {number}
     * @return {Array}
     */
    getSlotColumn(iSlot) {
        const entries = this._entries;
        const r = [];
        // pour chaque index de slot
        for (let iEntry = 0, nEntryCount = this.getEntryCount(); iEntry < nEntryCount; ++iEntry) {
            const entry = entries[iEntry];
            const slot = entry.slots[iSlot];
            if (slot.enabled) {
                r.push({
                    entry: iEntry,
                    counter: entry.counter
                });
            }
        }
        r.sort((a, b) => b.counter - a.counter);
        return r;
    }

    process(value = 1) {
        const entries = this._entries;
        // pour chaque index de slot
        for (let iSlot = 0, nSlotCount = this.getSlotCount(); iSlot < nSlotCount; ++iSlot) {
            const aColumn = this.getSlotColumn(iSlot);
            if (aColumn.length > 0) {
                // pour cette colone de slots il faut déterminer l'entrée qui a un compteur max
                aColumn.forEach(({entry, counter}, i, aSlots) => {
                    const iEntry = entry;
                    const oEntry = this.entries[iEntry];
                    if (!oEntry) {
                        throw new Error('undefined entry: ' + iEntry);
                    }
                    if (i === 0) {
                        // l'entrée max
                        oEntry.counter = 0;
                        this.setSlotValue(iEntry, iSlot, value);
                    } else {
                        // les autres entrées
                        oEntry.counter += oEntry.weight;
                    }
                })
            } else {
                // il n'y a pas assez de candidats... tout le monde est disabled
                throw new Error('could not process')
            }
        }
    }

    render() {
        const a = [];
        for (let iEntry = 0; iEntry < this.getEntryCount(); ++iEntry) {
            const s = [];
            for (let iSlot = 0; iSlot < this.getSlotCount(); ++iSlot) {
                const ges = this.getEntrySlot(iEntry, iSlot);
                s.push(ges.enabled ? ges.value : '.');
            }
            a.push(s.join(' '));
        }
        return a.join('\n');
    }
}

module.exports = ActivityDistribution;