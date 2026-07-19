const faqs = [
  {
    q: 'How do I track my order?',
    a: 'Log in and go to "Orders" from your account menu — you\'ll see the status of every order you\'ve placed.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Payments are processed securely through Paystack. Prices are shown in your local currency where possible, but the actual charge is made in Naira.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Tap "Sell on Pepenaldo" from the menu, fill in your business name, and you\'ll get your own seller dashboard immediately.',
  },
  {
    q: 'Can I return a product?',
    a: 'Return policies are set by individual sellers. Contact the seller directly through their storefront for return requests.',
  },
];

export default function HelpCenter() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl mb-2">Help Center</h1>
      <p className="text-gray-500 mb-10 font-mono text-sm">Answers to common questions.</p>

      <div className="flex flex-col gap-4">
        {faqs.map((f) => (
          <div key={f.q} className="bg-surface border border-line rounded-xl p-5">
            <p className="font-semibold mb-2">{f.q}</p>
            <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-surface border border-line rounded-xl p-5">
        <p className="font-semibold mb-2">Still need help?</p>
        <p className="text-gray-400 text-sm">
          Reach out to the seller of your specific order directly, or contact site support through your account page.
        </p>
      </div>
    </div>
  );
}
