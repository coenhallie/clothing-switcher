<template>
  <div class="legal-view">
    <h1 class="text-2xl font-semibold text-[var(--color-card-foreground)] tracking-tight">
      Terms of Service
    </h1>
    <p class="text-sm text-[var(--color-muted-foreground)] mt-1">
      Last updated: {{ lastUpdated }}
    </p>

    <div class="legal-view__body">
      <section class="legal-section">
        <h2 class="legal-section__title">1. Acceptance of Terms</h2>
        <p class="legal-section__text">
          By accessing or using SwitchFit, you agree to be bound by these Terms of
          Service. If you do not agree, please do not use our service.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">2. Service Description</h2>
        <p class="legal-section__text">
          SwitchFit provides an AI-powered virtual try-on service that generates
          outfit previews from uploaded photos. Results are AI-generated
          approximations and may not perfectly represent actual clothing fit or
          appearance.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">3. Credits &amp; Payments</h2>
        <p class="legal-section__text">
          Each generation consumes credits from your account balance. Credits are
          non-refundable once purchased, except when a generation fails — in which
          case credits are automatically refunded. Free credits granted at sign-up
          have no cash value.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">4. Acceptable Use</h2>
        <p class="legal-section__text">
          You may not upload content that is illegal, harmful, or violates the rights
          of others. You retain ownership of your uploaded images. SwitchFit does not
          claim ownership of generated results, but reserves the right to use
          anonymised, aggregated data for service improvement.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">5. Limitation of Liability</h2>
        <p class="legal-section__text">
          SwitchFit is provided "as is" without warranties of any kind. We are not
          liable for any indirect, incidental, or consequential damages arising from
          your use of the service.
        </p>
      </section>

      <section class="legal-section">
        <h2 class="legal-section__title">6. Contact</h2>
        <p class="legal-section__text">
          For questions about these terms, please contact us at
          <a href="mailto:legal@switchfit.studio" class="legal-link">legal@switchfit.studio</a>.
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
