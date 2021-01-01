const { interpret } = require('xstate');
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

  describe('interpreted machine', () => {
    const run = (fn, state) => {
      const svc = interpret(memberMachine);
      const states = [];
      svc.onTransition(state => states.push(state))
      svc.start(state);
      fn(svc);
      svc.stop();
      return states;
    }
    const runTest = (fn, exp, state) => {
      const states = run(fn, state);
      expect(states.length).toBe(exp.length);
      for (let idx = 0; idx < exp.length; idx++) {
        const s = states[idx];
        const e = exp[idx];
        expect(s.matches(e)).toBe(true);
      }
    }
    test('becoming a member', () => {
      runTest(
        svc => {
          svc.send('SUBMIT_APPLICATION');
          svc.send('PAY');
          svc.send('RAISE');
          svc.send('APPROVE');
        },
        [
          'noMember',
          { applied: 'unstartedAndUnpaid' },
          { applied: 'unstartedAndPaid' },
          { applied: 'raisedAndPaid' },
          'member',
        ]
      );
    });
    test('expelling a member', () => {
      runTest(
        svc => {
          svc.send('EXPEL');
        },
        [
          'member',
          'expelled',
        ],
        'member',
      );
    });
    test('member to lapsed to resigned', () => {
      runTest(
        svc => {
          svc.send('BEGIN_MEMBERSHIP_PERIOD');
          svc.send('BEGIN_MEMBERSHIP_PERIOD');
        },
        [
          'member',
          'lapsedMember',
          'resigned',
        ],
        'member',
      );
    });
    test('member to lapsed to member', () => {
      runTest(
        svc => {
          svc.send('BEGIN_MEMBERSHIP_PERIOD');
          svc.send('PAY');
          svc.send('BEGIN_MEMBERSHIP_PERIOD');
        },
        [
          'member',
          'lapsedMember',
          'member',
          'lapsedMember',
        ],
        'member',
      );
    });
  });
});
