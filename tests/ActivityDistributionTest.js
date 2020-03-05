const ActivityDistribution = require('../src/ActivityDistribution');

describe('Primary functions', function() {
    it('should be instanciable', function() {
        const ad = new ActivityDistribution();
        expect(ad).toBeDefined();
    });

    it('should have 1 entry', function() {
        const ad = new ActivityDistribution();
        expect(ad.entries.length).toBe(0);
        ad.setEntryCount(1);
        expect(ad.entries.length).toBe(1);
    });

    it('should have 1 entry and 1 slot', function() {
        const ad = new ActivityDistribution();
        ad.setEntryCount(1);
        ad.setSlotCount(1);
        expect(ad.entries[0].slots.length).toBe(1);
    });

    it('set some slot values', function() {
        const ad = new ActivityDistribution();
        ad.setEntryCount(3);
        ad.setSlotCount(6);
        ad.setSlotValue(0, 0, 1);
        ad.setSlotValue(2, 5, 1);
        ad.setSlotValue(1, 2, 1);
        ad.setSlotValue(1, 0, 1);
        ad.setSlotValue(0, 4, 1);
        expect(ad.getEntrySlot(0, 0).value).toBe(1);
        expect(ad.getEntrySlot(0, 1).value).toBe(0);
        expect(ad.getEntrySlot(0, 2).value).toBe(0);
        expect(ad.getEntrySlot(0, 3).value).toBe(0);
        expect(ad.getEntrySlot(0, 4).value).toBe(1);
        expect(() => ad.getEntrySlot(0, 14)).toThrow(new RangeError('this entry/slot does not exists : entry:0 slot:14'));
    })
});

describe('feed process', function() {
    it ('should feed ad', function() {
        const ad = new ActivityDistribution();
        ad.setEntryCount(3);
        ad.setSlotCount(3);
        ad.feed((iEntry, iSlot) => ({
            enabled: true,
            value: iEntry * 10 + iSlot
        }));
        expect(ad.getSlotValue(0, 0)).toBe(0);
        expect(ad.getSlotValue(0, 1)).toBe(1);
        expect(ad.getSlotValue(0, 2)).toBe(2);
        expect(ad.getSlotValue(1, 0)).toBe(10);
        expect(ad.getSlotValue(1, 1)).toBe(11);
        expect(ad.getSlotValue(1, 2)).toBe(12);
        expect(ad.getSlotValue(2, 0)).toBe(20);
        expect(ad.getSlotValue(2, 1)).toBe(21);
        expect(ad.getSlotValue(2, 2)).toBe(22);
    })
});

describe('set entries', function() {
    it ('should affect correct entries', function() {
        const ad = new ActivityDistribution();
        ad.setEntries([
            {
                id: 1,
                weight: 2,
                disable: []
            },
            {
                id: 2,
                weight: 1,
                disable: []
            },
            {
                id: 3,
                weight: 1,
                disable: []
            },
        ], 4);
        expect(ad.getEntryCount()).toBe(3);
        expect(ad.getSlotCount()).toBe(4);
        expect(ad.entries[0].id).toBe(1);
        expect(ad.entries[1].id).toBe(2);
        expect(ad.entries[2].id).toBe(3);
        expect(ad.entries[0].weight).toBe(2);
        expect(ad.entries[1].weight).toBe(1);
        expect(ad.entries[2].weight).toBe(1);
    });
});

describe('process', function() {
    it ('should process', function() {
        const ad = new ActivityDistribution();
        ad.setEntries([
            {
                id: 1,
                weight: 2,
                disable: []
            },
            {
                id: 2,
                weight: 1,
                disable: []
            },
            {
                id: 3,
                weight: 1,
                disable: []
            },
        ], 4);
        ad.process(1);
        expect(ad.render()).toBe('1 0 1 0\n0 1 0 0\n0 0 0 1');
    });
});

describe('process with disable', function() {
    it ('should process', function() {
        const ad = new ActivityDistribution();
        ad.setEntries([
            {
                id: 1,
                weight: 2,
                disable: [0, 1, 2, 3, 4]
            },
            {
                id: 2,
                weight: 1,
                disable: [5, 9]
            },
            {
                id: 3,
                weight: 1,
                disable: [8, 9, 10, 11]
            },
        ], 12);
        ad.process(1);
        console.log('\n' + ad.render());
    });
});