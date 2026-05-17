// Curated, plain-language policy copy for the five "Help & policies" pages.
// The WP-imported `content/pages.json` shipped with mismatched / placeholder
// HTML (FAQ was Lorem-ipsum, and shipping/refund/privacy/terms all had an
// identical marketing blurb), so the shell renders this module instead.
//
// Keep it short, specific to NuLakaz operations in Mauritius, and free of
// boilerplate legalese where possible. Update in code — it's intentionally
// not WP-managed so a content drift like the original can't recur.
//
// Each entry is a plain HTML string. PoliciesShell pipes it through the
// existing Tailwind `prose` block, so use semantic h2/h3/p/ul/strong/details
// markup and let the shell handle typography.

import type { PolicyKey } from "@/components/policies/PoliciesShell";

export const POLICY_CONTENT: Record<PolicyKey, string> = {
  // ------------------------------------------------------------------ FAQ
  faq: `
<p class="lead">A short list of the questions our customers ask most. If yours
isn't here, the contact form replies the same working day.</p>

<h2>Ordering</h2>

<details>
  <summary>How do I place an order?</summary>
  <p>Browse the shop, add what you need to the trolley, and check out. You can
  pay by card, MCB Juice, or cash on delivery. An account is optional — we'll
  send the confirmation to whatever email you give us at checkout.</p>
</details>

<details>
  <summary>What's the cut-off for next-day delivery?</summary>
  <p>Orders placed before <strong>16:00</strong> Monday to Friday go out the
  next working day. Anything after the cut-off, or on Saturday/Sunday, ships
  on the next available weekday slot.</p>
</details>

<details>
  <summary>Can I change or cancel my order?</summary>
  <p>Yes — until we mark it "packed". Reply to your order confirmation email
  or call <a href="tel:+23054889652">+230 5488 9652</a> and we'll edit or
  cancel it for you. After packing, we'll need to treat it as a return.</p>
</details>

<h2>Delivery</h2>

<details>
  <summary>Do you deliver everywhere in Mauritius?</summary>
  <p>Yes — across the whole island. Some remote areas in the south and on
  Rodrigues take an extra working day; we'll flag this on the order
  confirmation if it applies to your address.</p>
</details>

<details>
  <summary>How much is delivery?</summary>
  <p>Flat <strong>Rs 150</strong> for any order under Rs 1,000.
  <strong>Free</strong> on orders of Rs 1,000 and above. Cold-chain items
  (fresh produce, dairy, frozen) ship in insulated packaging at no extra
  cost.</p>
</details>

<details>
  <summary>Will someone always be home?</summary>
  <p>If nobody is at the address when our courier arrives, we'll call the
  number on the order. After two attempts on the same day, the parcel
  returns to our depot and we re-schedule for the next available slot at
  no extra charge.</p>
</details>

<h2>Stock & substitutions</h2>

<details>
  <summary>What if a fresh item runs out before you pack my order?</summary>
  <p>We refund the missing line back to your original payment method and
  ship everything else as planned — you'll see the refund on the delivery
  receipt and a confirmation by email within 24 hours. We never substitute
  a product without asking first.</p>
</details>

<details>
  <summary>Can I request a brand you don't stock?</summary>
  <p>Please do — write to <a href="mailto:info@nulakaz.com">info@nulakaz.com</a>
  with the product name and we'll look into sourcing it. Most additions
  come from customer requests.</p>
</details>

<h2>Payment & receipts</h2>

<details>
  <summary>What payment methods do you accept?</summary>
  <p>Card (Visa / Mastercard), MCB Juice, and cash on delivery. We don't
  store full card numbers — payments run through our processor and only
  the last four digits are kept against the order.</p>
</details>

<details>
  <summary>Do you issue an invoice?</summary>
  <p>Yes. A VAT-compliant invoice is attached to every order confirmation
  email and is also available from the order detail page once the order
  is delivered.</p>
</details>

<h2>Returns & refunds</h2>

<p>See the <a href="/refund-policy">refund policy</a> for the full details
— in short: tell us within 24 hours of delivery, send a photo if anything
is damaged, and we'll refund or replace.</p>
`,

  // -------------------------------------------------------- Shipping policy
  "shipping-policy": `
<p class="lead">How and when we deliver across Mauritius. The same terms
apply to every order — no surprise fees at checkout.</p>

<h2>Areas covered</h2>
<p>We deliver to every postal address in <strong>Mauritius</strong>, including
Rodrigues. There are no excluded zones. Some remote addresses in the south
of the island and on Rodrigues add one working day to the delivery window;
this is flagged on the order confirmation when it applies.</p>

<h2>Delivery windows</h2>
<ul>
  <li><strong>Monday – Friday</strong>, 10:00 to 18:00.</li>
  <li>No deliveries on Saturday, Sunday, or public holidays.</li>
  <li>You'll receive a 2-hour arrival window by SMS on the morning of
  delivery.</li>
</ul>

<h2>Cut-off times</h2>
<p>Orders placed before <strong>16:00</strong> on a working day are dispatched
the following working day. Orders placed after 16:00, or any time over the
weekend, ship on the next available weekday.</p>

<h2>Delivery fees</h2>
<ul>
  <li><strong>Free</strong> on orders of <strong>Rs 1,000</strong> or more.</li>
  <li>Flat <strong>Rs 150</strong> on orders below Rs 1,000.</li>
  <li>No surcharge for cold-chain (fresh, chilled, frozen) items — these
  ship in insulated packaging at no extra cost.</li>
</ul>

<h2>Cold-chain handling</h2>
<p>Fresh produce, dairy, meat, seafood and frozen items travel in insulated
totes with reusable ice packs. We do not leave cold-chain items at an
unattended address. If nobody is home after two attempts, the parcel
returns to depot and the perishable lines are refunded automatically.</p>

<h2>Receipt of delivery</h2>
<p>Our courier hands the parcel directly to the recipient and asks for a
signature on the digital docket. A copy of the docket and itemised invoice
is emailed at the moment of handover.</p>

<h2>Damaged or missing items</h2>
<p>Inspect the parcel before signing. If something is damaged or missing,
flag it with the courier and notify us within <strong>24 hours</strong>.
See the <a href="/refund-policy">refund policy</a> for what happens next.</p>
`,

  // ---------------------------------------------------------- Refund policy
  "refund-policy": `
<p class="lead">If something arrives short, damaged, or simply not right —
here's how we put it back in order. Refunds go to the original payment
method, never to a store credit, unless you explicitly ask.</p>

<h2>When you can request a refund</h2>
<ul>
  <li><strong>Damaged on arrival</strong> — packaging crushed, broken seals,
  spoiled produce.</li>
  <li><strong>Short delivery</strong> — an item on the invoice that's not in
  the parcel.</li>
  <li><strong>Wrong item</strong> — we packed something different from what
  you ordered.</li>
  <li><strong>Quality issue</strong> within shelf life — fresh item turning
  before its date, or a packaged product opened to find it spoiled.</li>
</ul>
<p>You have <strong>24 hours from delivery</strong> to flag damaged or
short items, and the full shelf-life of the product to flag a quality
issue.</p>

<h2>How to request</h2>
<ol>
  <li>Email <a href="mailto:info@nulakaz.com">info@nulakaz.com</a> or use the
  <a href="/contacts">contact form</a> with your order number.</li>
  <li>Attach a photo of the issue (the packaging, the affected item, or the
  invoice — whichever is clearest).</li>
  <li>Tell us whether you'd prefer a refund or a replacement on your next
  order.</li>
</ol>

<h2>Timelines</h2>
<ul>
  <li><strong>Card / MCB Juice payments</strong> — refund processed within
  one working day; appears on your statement within 5 to 7 working days
  depending on your bank.</li>
  <li><strong>Cash on delivery</strong> — refunded by bank transfer or as
  store credit (your choice) within two working days of agreement.</li>
  <li><strong>Replacements</strong> — included in your next order at no
  extra delivery cost.</li>
</ul>

<h2>What can't be refunded</h2>
<ul>
  <li>Perishable items accepted at the door without an issue raised, after
  the 24-hour window.</li>
  <li>Items consumed or used past more than half the package, unless the
  defect was hidden.</li>
  <li>Customer-driven changes of mind on bespoke or special-order items
  (these are flagged at checkout).</li>
</ul>

<h2>Disputes</h2>
<p>If we can't agree on the outcome, the order can be escalated to the
Mauritius Consumer Protection Bureau. We rarely get there — most issues
are resolved within 24 hours of the first email.</p>
`,

  // --------------------------------------------------------- Privacy policy
  "privacy-policy": `
<p class="lead">What we collect, why we keep it, and how to ask us to
forget. Written without legalese where we can; you can always email
<a href="mailto:info@nulakaz.com">info@nulakaz.com</a> to ask a specific
question.</p>

<h2>Who we are</h2>
<p>NuLaz Online Grocery, registered in Mauritius and operating the
<strong>NuLakaz</strong> storefront at nulakaz.com. The data controller
for everything below is the company; the contact point is
<a href="mailto:info@nulakaz.com">info@nulakaz.com</a>.</p>

<h2>What we collect</h2>
<ul>
  <li><strong>Account &amp; order info</strong> — name, email, phone,
  delivery address, order history.</li>
  <li><strong>Payment info</strong> — handled by our payment processor;
  we only keep the last four digits of the card and the transaction
  reference. We never see the full card number or CVV.</li>
  <li><strong>Browsing info</strong> — pages viewed, search queries on the
  site, basic device and browser information, via first-party analytics.</li>
  <li><strong>Communication</strong> — emails or chat messages you send us
  and our replies.</li>
</ul>

<h2>Why we keep it</h2>
<ul>
  <li>To fulfil and deliver your order, and contact you about it.</li>
  <li>To handle returns, refunds and customer-support tickets.</li>
  <li>To improve the shop — which products land on the home page, which
  search terms have no results, etc.</li>
  <li>To send marketing messages <em>only</em> if you opt in. Unsubscribe
  via any newsletter footer or by emailing us.</li>
</ul>

<h2>Who we share it with</h2>
<p>We share strictly what's needed to run the order:</p>
<ul>
  <li><strong>Delivery couriers</strong> — name, phone, address, order
  contents.</li>
  <li><strong>Payment processor</strong> — billing details for the
  transaction.</li>
  <li><strong>Cloud infrastructure</strong> (Supabase, Vercel) — encrypted
  storage and request handling, under data-processing agreements.</li>
</ul>
<p>We do <strong>not</strong> sell your data, share it with advertising
networks, or use it to retarget you across the web.</p>

<h2>How long we keep it</h2>
<ul>
  <li>Account info — for as long as the account exists, then 12 months
  after deletion request for legal/audit purposes.</li>
  <li>Order records — 7 years (Mauritius accounting requirement).</li>
  <li>Marketing consent — until you withdraw it.</li>
</ul>

<h2>Your rights</h2>
<p>You can ask us at any time to:</p>
<ul>
  <li>See what we hold about you (data access).</li>
  <li>Correct anything that's wrong.</li>
  <li>Delete your account and personal data, subject to the retention
  rules above.</li>
  <li>Opt out of marketing.</li>
</ul>
<p>Email <a href="mailto:info@nulakaz.com">info@nulakaz.com</a> with the
subject line "Privacy request" and we'll respond within 14 days.</p>

<h2>Cookies</h2>
<p>We use first-party cookies for cart state, login sessions, and
anonymous analytics. We don't set third-party advertising cookies. You
can clear or block cookies in your browser; the shop will still work,
but you'll be logged out and your trolley will reset.</p>
`,

  // ---------------------------------------------------- Terms & conditions
  "terms-and-conditions": `
<p class="lead">The agreement that sits behind every order placed on
nulakaz.com. By checking out, you accept these terms — if there's
anything you don't agree with, please reach out before placing the
order.</p>

<h2>Who we are</h2>
<p>NuLaz Online Grocery (operating the NuLakaz storefront at nulakaz.com),
registered in Mauritius. Address: 222 Royal Road, Riche Terre, Mauritius.
Contact: <a href="mailto:info@nulakaz.com">info@nulakaz.com</a> /
<a href="tel:+23054889652">+230 5488 9652</a>.</p>

<h2>Eligibility</h2>
<ul>
  <li>You must be <strong>18 or older</strong> to place an order.</li>
  <li>Delivery is restricted to addresses within
  <strong>Mauritius and Rodrigues</strong>.</li>
  <li>Some products (e.g. alcohol where stocked) require ID on delivery.</li>
</ul>

<h2>Pricing &amp; availability</h2>
<ul>
  <li>All prices are in <strong>Mauritian Rupees (Rs / MUR)</strong> and
  inclusive of any applicable VAT, unless otherwise stated.</li>
  <li>Prices may change without notice. The price you see at checkout is
  the price we charge.</li>
  <li>If an item goes out of stock between order and packing, we refund
  that line and ship the rest.</li>
  <li>Product images are representative — packaging may be updated by
  the supplier between photo and shelf.</li>
</ul>

<h2>Order acceptance</h2>
<p>An order isn't accepted until you receive the confirmation email. If
we can't fulfil all or part of an order (stock, address, payment), we'll
let you know and refund any amount already taken.</p>

<h2>Payment</h2>
<p>We accept Visa, Mastercard, MCB Juice, and cash on delivery. Card and
Juice payments are authorised at checkout and captured at dispatch.
Failed authorisations cancel the order automatically.</p>

<h2>Delivery</h2>
<p>Delivery times, fees and conditions are described in the
<a href="/shipping-policy">shipping policy</a>. The risk of loss
transfers to you on handover.</p>

<h2>Returns &amp; refunds</h2>
<p>Set out in full in the <a href="/refund-policy">refund policy</a>.
Notify us within 24 hours of delivery for damaged or short items.</p>

<h2>Liability</h2>
<p>We're liable for the value of the order and any direct loss caused by
our negligence. We're not liable for indirect or consequential loss
(missed events, secondary purchases, etc.) caused by a late or missing
delivery. Nothing in these terms limits liability where the law of
Mauritius prohibits it.</p>

<h2>Intellectual property</h2>
<p>All NuLakaz branding, photography and copy on the site are owned by
NuLaz Online Grocery. You may save or print a copy for personal use; any
other reuse needs written permission.</p>

<h2>Account use</h2>
<p>Keep your password confidential — anyone who logs in with it can place
orders charged to you. Tell us immediately if you suspect your account
has been accessed by someone else.</p>

<h2>Governing law</h2>
<p>These terms are governed by the law of <strong>Mauritius</strong> and
any dispute will be settled by the courts of Mauritius. Where a
consumer-protection right is mandatory, it overrides anything to the
contrary in this document.</p>

<h2>Changes</h2>
<p>We update these terms occasionally — the latest revision date is shown
at the top of this page. Material changes (anything that affects orders
already placed) will be emailed to active customers ahead of taking
effect.</p>
`,
};
