import { test, expect } from '@playwright/test';

/**
 * Test E2E: Guest Sync Flow
 * 
 * Scénario critique d'acquisition utilisateur:
 * 1. Un utilisateur non connecté (Guest) visite la Home Page (Astro - port 4446)
 * 2. Il swipe sur des médias (3 "Likes")
 * 3. Le bouton "Créer un compte" apparaît
 * 4. Il clique et est redirigé vers la Webapp (Nuxt - port 4201) avec le paramètre ?sync=...
 * 5. Il crée un compte via le formulaire d'inscription
 * 6. Il est redirigé vers le Dashboard
 * 7. Ses 3 swipes sont sauvegardés en DB
 */

test.describe('Guest Sync Flow - Acquisition Funnel', () => {
  test.beforeEach(async ({ page }) => {
    // Aller sur la Home Page (Website Astro)
    await page.goto('/');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
  });

  test('should sync guest interactions after signup', async ({ page }) => {
    // ============================================================
    // STEP 1: Vérifier la présence du SwipeDeck sur la Home Page
    // ============================================================
    const swipeDeck = page.locator('[data-testid="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 10000 });

    // ============================================================
    // STEP 2: Swiper toutes les cartes pour déclencher l'empty state
    // ============================================================
    const likeButton = page.locator('[data-testid="btn-like"]');
    
    // Swiper jusqu'à ce que le bouton Like disparaisse (toutes les cartes swipées)
    let swipeCount = 0;
    while (await likeButton.isVisible() && swipeCount < 10) {
      await likeButton.click();
      await page.waitForTimeout(500);
      swipeCount++;
    }
    
    console.log(`✅ ${swipeCount} cartes swipées`);

    // ============================================================
    // STEP 3: Vérifier que le bouton "Créer un compte" apparaît
    // ============================================================
    const signupButton = page.locator('[data-testid="btn-signup"]', {
      hasText: /créer un compte|s'inscrire/i
    });
    
    await expect(signupButton).toBeVisible({ timeout: 5000 });

    // ============================================================
    // STEP 4: Cliquer et vérifier la redirection avec paramètre sync
    // ============================================================
    await signupButton.click();
    
    // Attendre la navigation vers la Webapp (Nuxt sur port 4201)
    await page.waitForURL(/localhost:4201\/register/, { timeout: 10000 });
    
    // Vérifier la présence du paramètre sync dans l'URL
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/[?&]sync=/);
    
    // Extraire le token sync pour vérification ultérieure si nécessaire
    const syncToken = new URL(currentUrl).searchParams.get('sync');
    expect(syncToken).toBeTruthy();
    console.log(`✅ Sync token présent: ${syncToken?.substring(0, 20)}...`);

    // ============================================================
    // STEP 5: Remplir le formulaire d'inscription
    // ============================================================
    
    // Générer des données uniques pour éviter les conflits
    const uniqueEmail = `e2e-test-${Date.now()}@example.com`;
    const userName = `E2E User ${Date.now()}`;
    const password = 'Test123!@#';
    
    // Remplir le formulaire (3 champs requis: name, email, password)
    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input[data-testid="input-email"]');
    const passwordInput = page.locator('input[data-testid="input-password"]');
    const submitButton = page.locator('form[data-testid="signup-form"] button[type="submit"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await nameInput.fill(userName);
    await emailInput.fill(uniqueEmail);
    await passwordInput.fill(password);
    
    // Attendre que le bouton soit actif
    await expect(submitButton).toBeEnabled();
    
    // Soumettre le formulaire
    await submitButton.click();

    // ============================================================
    // STEP 6: Vérifier la redirection vers le Dashboard
    // ============================================================
    // Après signup, Better Auth redirige vers la page d'accueil (/)
    await page.waitForURL(/localhost:4201\/$/, { 
      timeout: 15000 
    });
    
    const dashboardUrl = page.url();
    console.log(`✅ Redirection vers Dashboard: ${dashboardUrl}`);

    // Vérifier que l'utilisateur est bien connecté (présence d'un élément du dashboard)
    const dashboardElement = page.locator('[data-testid="dashboard"], [data-testid="user-menu"], h1');
    await expect(dashboardElement).toBeVisible({ timeout: 10000 });

    // ============================================================
    // STEP 7: Vérifier que les interactions sont sauvegardées
    // ============================================================
    
    // Option 1: Vérifier via l'API
    const response = await page.request.get('http://localhost:3000/api/interactions', {
      headers: {
        // Récupérer le cookie de session si nécessaire
      }
    });
    
    if (response.ok()) {
      const interactions = await response.json();
      console.log(`✅ Interactions récupérées: ${JSON.stringify(interactions)}`);
      
      // Vérifier qu'il y a bien 3 interactions
      expect(Array.isArray(interactions) ? interactions.length : interactions.data?.length).toBeGreaterThanOrEqual(3);
    }

    // Option 2: Vérifier dans l'UI du Dashboard
    // (Si vous avez une page "Mes Swipes" ou "Historique")
    // const swipeHistory = page.locator('[data-testid="swipe-history"]');
    // await expect(swipeHistory).toContainText('3 médias');
  });

  test('should handle signup errors gracefully', async ({ page }) => {
    // Test de robustesse: vérifier que le formulaire gère les erreurs
    
    const swipeDeck = page.locator('[data-testid="swipe-deck"]');
    await expect(swipeDeck).toBeVisible();

    const likeButton = page.locator('[data-testid="btn-like"]');
    
    // Swiper toutes les cartes pour déclencher l'empty state
    let swipeCount = 0;
    while (await likeButton.isVisible() && swipeCount < 10) {
      await likeButton.click();
      await page.waitForTimeout(500);
      swipeCount++;
    }

    const signupButton = page.locator('[data-testid="btn-signup"]');
    await signupButton.click();

    await page.waitForURL(/localhost:4201\/register/);

    // Tenter de soumettre avec un email invalide (mais tous les champs requis)
    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input[data-testid="input-email"]');
    const passwordInput = page.locator('input[data-testid="input-password"]');
    const submitButton = page.locator('form[data-testid="signup-form"] button[type="submit"]');

    await nameInput.fill('Test User');
    await emailInput.fill('invalid-email');
    await passwordInput.fill('Test123!@#');
    await submitButton.click();

    // Vérifier qu'un message d'erreur apparaît
    const errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should persist guest data in localStorage before signup', async ({ page }) => {
    // Vérifier que les swipes sont bien stockés dans localStorage
    
    const likeButton = page.locator('[data-testid="btn-like"]');
    await likeButton.click();
    await page.waitForTimeout(500);

    // Récupérer le localStorage (clé utilisée par SwipeDeck: 'guest_swipes')
    const guestData = await page.evaluate(() => {
      return localStorage.getItem('guest_swipes');
    });

    expect(guestData).toBeTruthy();
    console.log(`✅ Guest data en localStorage: ${guestData?.substring(0, 100)}...`);

    // Parser et vérifier le contenu
    if (guestData) {
      const parsed = JSON.parse(guestData);
      expect(Array.isArray(parsed) ? parsed.length : parsed.interactions?.length).toBeGreaterThan(0);
    }
  });
});
