const { memberMachine } = require('.');

describe('memberMachine', () => {
  for (const [state, action, match] of [
    ['noMember', 'SUBMIT_APPLICATION', { applied: 'unstartedAndUnpaid' }],
    ['applied.unstartedAndUnpaid', 'PAY', { applied: 'unstartedAndPaid' }],
    ['applied.unstartedAndUnpaid', 'RAISE', { applied: 'raisedAndUnpaid' }],
    ['applied.raisedAndUnpaid', 'APPROVE', 'paymentPending'],
    ['applied.raisedAndUnpaid', 'REJECT', 'noMember'],
    ['applied.unstartedAndPaid', 'RAISE', { applied: 'raisedAndPaid' }],
    ['applied.raisedAndPaid', 'APPROVE', 'member'],
    ['applied.raisedAndPaid', 'REJECT', 'refundPending'],
    ['refundPending', 'REFUND', 'noMember'],
    ['paymentPending', 'PAY', 'member'],
    ['member', 'EXPEL', 'expelled'],
    ['member', 'RESIGN', 'resigned'],
    ['member', 'BEGIN_MEMBERSHIP_PERIOD', 'lapsedMember'],
    ['lapsedMember', 'EXPEL', 'expelled'],
    ['lapsedMember', 'RESIGN', 'resigned'],
    ['lapsedMember', 'BEGIN_MEMBERSHIP_PERIOD', 'resigned'],
    ['lapsedMember', 'PAY', 'member'],
    ['resigned', 'SUBMIT_APPLICATION', { applied: 'unstartedAndUnpaid' }],
  ]) {
    test(`${state} allows ${action}`, () => {
      const s = memberMachine.transition(state, action);
      expect(s.matches(match)).toBe(true);
    });
  }
});
