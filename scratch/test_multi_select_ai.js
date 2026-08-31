async function testMultiSelect() {
  // Test 1: User selects only 'Mobile App' + 'Fast Delivery'
  const res1 = await fetch('http://localhost:3005/api/review/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Onetech Solution',
      slug: 'onetech-solution',
      selectedServices: ['Mobile App'],
      selectedTags: ['Fast Delivery'],
      rating: 5,
    }),
  });
  const data1 = await res1.json();
  console.log('--- Test 1 (Only Mobile App + Fast Delivery) ---');
  console.log('Review:', data1.review);

  // Test 2: User selects 'Custom Web App' + 'Top Quality' + 'Great Support'
  const res2 = await fetch('http://localhost:3005/api/review/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Onetech Solution',
      slug: 'onetech-solution',
      selectedServices: ['Custom Web App'],
      selectedTags: ['Top Quality', 'Great Support'],
      rating: 5,
    }),
  });
  const data2 = await res2.json();
  console.log('\n--- Test 2 (Only Custom Web App + Top Quality + Great Support) ---');
  console.log('Review:', data2.review);
}

testMultiSelect().catch(console.error);
