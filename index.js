const { createMachine } = require('xstate');

exports.memberDef = {
  id: 'member',
  initial: 'noMember',
  states: {
    noMember: {
      on: {
        SUBMIT_APPLICATION: 'applied',
      },
    },
    applied: {
      initial: 'unstartedAndUnpaid',
      states: {
        unstartedAndUnpaid: {
          on: {
            PAY: 'unstartedAndPaid',
            RAISE: 'raisedAndUnpaid',
          },
        },
        raisedAndUnpaid: {
          on: {
            PAY: 'raisedAndPaid',
            APPROVE: 'approvedAndUnpaid',
            REJECT: 'rejectedAndUnpaid',
          },
        },
        approvedAndUnpaid: {
          // on: { '': '#member.paymentPending' },
          always: '#member.paymentPending',
        },
        rejectedAndUnpaid: {
          // on: { '': '#member.noMember' },
          always: '#member.noMember',
        },
        unstartedAndPaid: {
          on: {
            RAISE: 'raisedAndPaid',
          },
        },
        raisedAndPaid: {
          on: {
            APPROVE: 'approvedAndPaid',
            REJECT: 'rejectedAndPaid',
          },
        },
        approvedAndPaid: {
          // on: { '': '#member.member' },
          always: '#member.member',
        },
        rejectedAndPaid: {
          // on: { '': '#member.refundPending' },
          always: '#member.refundPending',
        },
      },
    },
    refundPending: {
      on: {
        REFUND: 'noMember',
      },
    },
    paymentPending: {
      on: {
        // EXPEL/RESIGN?
        PAY: 'member',
      },
    },
    member: {
      on: {
        EXPEL: 'expelled',
        RESIGN: 'resigned',
        BEGIN_MEMBERSHIP_PERIOD: 'lapsedMember',
      },
    },
    lapsedMember: {
      on: {
        EXPEL: 'expelled',
        RESIGN: 'resigned',
        BEGIN_MEMBERSHIP_PERIOD: 'resigned',
        PAY: 'member',
      },
    },
    resigned: {
      on: {
        SUBMIT_APPLICATION: 'applied',
      },
    },
    expelled: {
      type: 'final',
    },
  },
};

exports.memberMachine = createMachine(exports.memberDef);
