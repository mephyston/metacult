
const API_URL = 'http://localhost:3333';

async function testImport(type: 'games' | 'movies' | 'tv' | 'books', id: string) {
    console.log(`🚀 Testing Import for ${type} (ID: ${id})...`);
    try {
        const response = await fetch(`${API_URL}/import/${type}/${id}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ [${response.status}] Success:`, data);
        } else {
            console.error(`❌ [${response.status}] Failed:`, await response.text());
        }
    } catch (error) {
        console.error('💥 Network Error:', error);
    }
    console.log('---');
}

async function main() {
    console.log('🧪 Starting End-to-End Import Test...\n');

    // 1. Test Game Import (The Legend of Zelda: Breath of the Wild - IGDB ID: 7346)
    await testImport('games', '7346');

    // 2. Test Movie Import (The Matrix - TMDB ID: 603)
    await testImport('movies', '603');

    // 3. Test TV Show Import (Breaking Bad - TMDB ID: 1396)
    await testImport('tv', '1396');

    // 4. Test Book Import (Harry Potter - Google Volume ID: wrOQLV6xB-wC)
    await testImport('books', 'wrOQLV6xB-wC');
}

main();
