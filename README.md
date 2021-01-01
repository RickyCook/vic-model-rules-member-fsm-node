# Victorian model rules member FSM

The Victorian government provides a set of "model rules** for incorporated
associations that form the basis for how many such organisations choose to
operate. These rules contain rights, responsibilities, and processes relating
to the management of organisation members. These can be a little opaque, so to
help create compliant systems, this is an expression of a subset of the rules.

**This isn't necessarily either entirely correct, nor complete.** It is,
however, a reasonable simplification that can be tweaked to add more
correct/complete state going forward.

## Getting the current state of a member

The machine is made so that you keep an ordered log of actions, and replay
them to get the current state. In the following example, the string arguments
to `svc.send` are the ordered logs.

```js
const { memberService } = require('vic-model-rules-member-fsm');

const svc = memberService();
svc.start();

svc.send('SUBMIT_APPLICATION');
console.log(svc.state.value);                // { applied: 'unstartedAndUnpaid' }
console.log(svc.state.matches('applied'));   // true
console.log(svc.state.matches({ applied: 'unstartedAndUnpaid' }));  // true

svc.send('PAY');
svc.send('RAISE');
svc.send('APPROVE');
console.log(svc.state.value);                // member
console.log(svc.state.matches('member'));    // true

svc.send('EXPEL');
console.log(svc.state.value);                // expelled
console.log(svc.state.matches('expelled'));  // true
console.log(svc.state.matches('member'));    // false

svc.stop();
```

## Member expiry

According to the model rules, members have 12 months after their membership has
lapsed to renew their membership. If they don't renew in this period, they are
considered to have implicitly resigned (and will need to go through the
application process again). This is enabled via the `BEGIN_MEMBERSHIP_PERIOD`
actions, and the `lapsedMember` state:

```js
const svc = memberService();
svc.start('member');  // force-start the machine in the member state

svc.send('BEGIN_MEMBERSHIP_PERIOD');
console.log(svc.state.value);                // lapsedMember
svc.send('BEGIN_MEMBERSHIP_PERIOD');
console.log(svc.state.value);                // resigned
```

A member in the `lapsedMember` state can trigger the `PAY` action to get back
to the `member` state.

The `BEGIN_MEMBERSHIP_PERIOD` log action should probably be automatically
generated to avoid denormalised data wherever you store the other log actions.
