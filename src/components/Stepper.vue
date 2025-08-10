<template>
  <div class="stepper">
    <div 
      v-for="(step, index) in steps" 
      :key="index"
      class="step"
      :class="{
        'active': index === currentStep,
        'completed': index < currentStep,
        'disabled': index > currentStep
      }"
    >
      <div class="step-circle">
        <span v-if="index < currentStep">✓</span>
        <span v-else>{{ index + 1 }}</span>
      </div>
      <div class="step-connector" v-if="index < steps - 1"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  steps: number
  currentStep: number
}

defineProps<Props>()
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  padding: 0 1rem;
}

.step {
  display: flex;
  align-items: center;
  position: relative;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
}

.step.active .step-circle {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.step.completed .step-circle {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step-connector {
  width: 60px;
  height: 2px;
  background: #e5e7eb;
  margin: 0 8px;
  transition: all 0.3s ease;
}

.step.completed .step-connector {
  background: #10b981;
}

@media (max-width: 640px) {
  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .step-connector {
    width: 40px;
    margin: 0 4px;
  }
}
</style>