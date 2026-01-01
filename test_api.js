async function testApi() {
    const id = "0d6b6107-e1b8-4ba9-af96-c1fd77e445b3";
    const url = `http://localhost:3000/api/users/${id}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testApi();
