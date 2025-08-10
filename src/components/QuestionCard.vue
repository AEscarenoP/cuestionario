<template>
  <div class="question-card">
    <h2 class="question-title">{{ question.text }}</h2>
    
    <!-- Text Input -->
    <div v-if="question.type === 'text'" class="input-group">
      <input
        type="text"
        v-model="answer"
        @input="updateAnswer"
        @blur="handleTextComplete"
        @keypress.enter="handleTextComplete"
        class="text-input"
        :placeholder="'Tu respuesta...' + (question.required ? ' (Presiona Enter cuando termines)' : '')"
        :required="question.required"
      />
    </div>

    <!-- Multiple Choice -->
    <div v-else-if="question.type === 'multiple_choice'" class="input-group">
      <div 
        v-for="option in question.options" 
        :key="option"
        class="option"
        :class="{ 'selected': answer === option }"
        @click="selectOption(option)"
      >
        <div class="option-circle">
          <div v-if="answer === option" class="option-dot"></div>
        </div>
        <span>{{ option }}</span>
      </div>
    </div>

    <!-- Yes/No -->
    <div v-else-if="question.type === 'yes_no'" class="input-group">
      <div class="yes-no-buttons">
        <button
          class="btn"
          :class="{ 'btn-selected': answer === 'SI', 'btn-yes': true }"
          @click="selectOption('SI')"
        >
          Sí
        </button>
        <button
          class="btn"
          :class="{ 'btn-selected': answer === 'NO', 'btn-no': true }"
          @click="selectOption('NO')"
        >
          No
        </button>
      </div>
    </div>

    <!-- Special Question -->
    <div v-else-if="question.type === 'special'" class="input-group">
      <div 
        class="option special-option"
        :class="{ 'selected': answer === 'SI' }"
        @click="selectOption('SI')"
      >
        <div class="option-circle">
          <div v-if="answer === 'SI'" class="option-dot"></div>
        </div>
        <span>¡Sí! 💕</span>
      </div>
      <div 
        v-if="!answer || answer !== 'SI'"
        class="option special-option no-option"
        :class="{ 'disappearing': noClicked }"
        @click="handleNoClick"
      >
        <div class="option-circle">
          <div v-if="answer === 'NO'" class="option-dot"></div>
        </div>
        <span>No</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Question } from '../lib/supabase'

interface Props {
  question: Question
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'answer-selected', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const answer = ref(props.modelValue || '')
const noClicked = ref(false)

function updateAnswer() {
  emit('update:modelValue', answer.value)
  emit('answer-selected', answer.value)
}

function selectOption(option: string) {
  answer.value = option
  updateAnswer()
}

function handleNoClick() {
  noClicked.value = true
  // Hacer que desaparezca después de un momento
  setTimeout(() => {
    // La opción "No" desaparecerá debido al v-if en el template
  }, 500)
}

function handleTextComplete() {
  if (answer.value.trim()) {
    emit('answer-selected', answer.value)
  }
}

// No need for onMounted anymore
</script>

<style scoped>
.question-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.question-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.4;
}

.input-group {
  margin-top: 1rem;
}

.text-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  outline: none;
}

.text-input:focus {
  border-color: #3b82f6;
}

.option {
  display: flex;
  align-items: center;
  padding: 0.875rem 1rem;
  margin-bottom: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.option.selected .option-circle {
  border-color: #3b82f6;
}

.option-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
}

.yes-no-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  position: relative;
  min-height: 120px;
  align-items: center;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  font-size: 1rem;
}

.btn-yes {
  background: #10b981;
  color: white;
}

.btn-yes:hover {
  background: #059669;
  transform: translateY(-2px);
}

.btn-no {
  background: #ef4444;
  color: white;
}

.btn-no:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

.btn-selected {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.special-option {
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.special-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.special-option span {
  font-size: 1.125rem;
  font-weight: 600;
}

.no-option.disappearing {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease-out;
}

@media (max-width: 640px) {
  .question-card {
    padding: 1.5rem;
    margin: 0 1rem;
  }
  
  .question-title {
    font-size: 1.25rem;
  }
  
  .yes-no-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
  }
}
</style>