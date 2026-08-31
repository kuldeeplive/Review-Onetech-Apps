async function testAi() {
  const res = await fetch('http://localhost:3005/api/review/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Onetech Solution',
      slug: 'onetech-solution',
      tag: 'Top Quality',
      rating: 5,
    }),
  });

  const data = await res.json();
  console.log('--- Result for Top Quality ---');
  console.log('Review:', data.review);
  console.log('Source:', data.source);

  const res2 = await fetch('http://localhost:3005/api/review/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Onetech Solution',
      slug: 'onetech-solution',
      tag: 'Fast Delivery',
      rating: 5,
    }),
  });

  const data2 = await res2.json();
  console.log('\n--- Result for Fast Delivery ---');
  console.log('Review:', data2.review);
  console.log('Source:', data2.source);
}

testAi().catch(console.error);
