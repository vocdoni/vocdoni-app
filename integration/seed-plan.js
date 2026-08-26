// Seeds a single default plan into a fresh saas-backend mongo database.
//
// A fresh saasdb.plans collection is EMPTY: migration 0014_plan_ids_to_stripe_product_ids
// deletes the old integer-keyed stub plans and expects them to be repopulated by a Stripe
// product sync, which never runs against this disposable stack. Without a plan,
// POST /organizations fails with 400 {"error":"no default plan available: not found"} —
// i.e. the very first thing the e2e signup flow does after verifying the account.
//
// `features.twoFaEmail` is what permits the email 2FA channel the CSP voting suite
// depends on; without quota there the OTP challenge is refused before any mail is sent.
//
// Source of truth for the shape below: saas-backend's own seeding tool,
// scripts/defaultplan/main.go, and the db.Plan / PlanLimits / Features struct
// definitions in db/types.go. Copy field VALUES from defaultplan/main.go when it
// changes; copy field NAMES from types.go.
//
// IMPORTANT: the fields below are the mongo **bson** tags, which differ from the
// struct's json tags used elsewhere in the API (e.g. HTTP responses / requests).
// Notably: `users` here is `teamMembers` in JSON, and `drafts` here is `maxDrafts`
// in JSON. If saas-backend renames a bson tag, this seed silently stops matching
// db.Plan and organizations.getDefaultPlan will report "not found" again even
// though this script ran without error — that's what the post-seed assertion in
// scripts/integration-stack.sh (GET /plans must return a non-empty list) is for.
db = db.getSiblingDB('saasdb')
db.plans.updateOne(
  { _id: 'local-dev' },
  {
    $set: {
      name: 'Local Dev',
      default: true,
      public: true,
      stripeMonthlyPriceID: '',
      stripeYearlyPriceID: '',
      monthlyPrice: NumberLong(0),
      yearlyPrice: NumberLong(0),
      freeTrialDays: 0,
      organization: {
        users: 100,
        subOrgs: 10,
        maxProcesses: 1000,
        maxCensus: 1000,
        maxVotes: 0,
        maxDuration: 365,
        customURL: true,
        drafts: 100,
        customPlan: true,
      },
      votingTypes: {
        single: true,
        multiple: true,
        approval: true,
        cumulative: true,
        ranked: true,
        weighted: true,
      },
      features: {
        anonymous: true,
        overwrite: true,
        liveResults: true,
        personalization: true,
        emailReminder: true,
        twoFaSms: 1000,
        twoFaEmail: 1000,
        whiteLabel: true,
        liveStreaming: true,
        phoneSupport: true,
      },
    },
  },
  { upsert: true }
)
printjson(db.plans.find().toArray())
