<template>
  <div class="legal-view">
    <h1 class="text-2xl font-semibold text-[var(--color-card-foreground)] tracking-tight">
      Privacy Policy
    </h1>
    <p class="text-sm text-[var(--color-muted-foreground)] mt-1">
      Last updated: {{ lastUpdated }}
    </p>

    <div class="legal-view__body">
      <section class="legal-section">
        <h2 class="legal-section__title">1. Information We Collect</h2>
        <p class="legal-section__text">
          When you use SwitchFit, we collect information you provide directly,
          including your email address when registering, and the images you upload
          for virtual try-on processing. Uploaded images are processed in real-time
          and are not permanently stored on our servers after generation is complete.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">2. How We Use Your Information</h2>
        <p class="legal-section__text">
          We use collected information to provide and improve our AI-powered virtual
          try-on service, process your credit transactions, and communicate service
          updates. We do not sell your personal data to third parties.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">3. Data Security</h2>
        <p class="legal-section__text">
          We implement industry-standard security measures to protect your data,
          including encryption in transit and at rest. Your uploaded images are
          processed securely and deleted after generation completes.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">4. Your Rights</h2>
        <p class="legal-section__text">
          You may request access to, correction of, or deletion of your personal
          data at any time by contacting us. You can delete your account and all
          associated data from the Settings page.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">5. Contact</h2>
        <p class="legal-section__text">
          For privacy-related inquiries, please contact us at
          <a href="mailto:privacy@switchfit.studio" class="legal-link">privacy@switchfit.studio</a>.
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
const lastUpdated = 'February 2026';
</script>

<style scoped>
.legal-view {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem 0 3rem;
}

.legal-view__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
}

.legal-section__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-card-foreground);
  margin-bottom: 0.5rem;
}

.legal-section__text {
  font-size: 0.8125rem;
  line-height: 1.65;
  color: var(--color-muted-foreground);
}

.legal-link {
  color: var(--color-card-foreground);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: var(--color-border);
  transition: text-decoration-color 0.15s ease;
}

.legal-link:hover {
  text-decoration-color: var(--color-card-foreground);
  opacity: 1;
}
</style>
