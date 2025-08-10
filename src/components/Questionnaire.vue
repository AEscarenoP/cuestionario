<template>
  <div class="questionnaire">
    <div class="container">
      <Stepper :steps="questions.length" :currentStep="currentStep" />
      
      <div v-if="!isCompleted" class="question-wrapper">
        <QuestionCard
          v-if="currentQuestion"
          :question="currentQuestion"
          :key="currentQuestion.id"
          v-model="currentAnswer"
          @answer-selected="handleAnswerSelected"
        />
        
        <div class="navigation">
          <button
            v-if="currentStep > 0"
            @click="previousQuestion"
            class="btn btn-secondary"
          >
            ← Anterior
          </button>
          
          <button
            v-if="currentStep < questions.length - 1 && hasAnswer && currentStep !== questions.length - 1"
            @click="nextQuestion"
            class="btn btn-primary"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div v-else class="completion-screen">
        <div class="completion-card">
          <h2 v-if="finalAnswer === 'SI'" class="success-title">
            ¡Qué emoción! 🎉
          </h2>
          <h2 v-else class="neutral-title">
            ¡Gracias por completar el cuestionario! 
          </h2>
          
          <p v-if="finalAnswer === 'SI'" class="success-message">
            ¡Me hace muy feliz tu respuesta! Pronto te contactaré para planear nuestra cita. 💕
          </p>
          <p v-else class="neutral-message">
            Tus respuestas han sido guardadas correctamente.
          </p>
          
          <button @click="restartQuestionnaire" class="btn btn-primary">
            Comenzar de nuevo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Stepper from './Stepper.vue'
import QuestionCard from './QuestionCard.vue'
import { supabase, type Question, type QuestionnaireSession, type Response } from '../lib/supabase'

const questions = ref<Question[]>([])
const currentStep = ref(0)
const answers = ref<Record<string, string>>({})
const currentAnswer = ref('')
const sessionId = ref<string>('')
const isCompleted = ref(false)
const finalAnswer = ref<string>('')

const currentQuestion = computed(() => questions.value[currentStep.value])
const hasAnswer = computed(() => !!currentAnswer.value && currentAnswer.value.trim() !== '')

async function loadQuestions() {
  // Hardcoded questions since they're not in the database
  questions.value = [
    {
      id: '1',
      text: '¿Cuál es tu correo electrónico?',
      type: 'text',
      required: true,
      order: 1
    },
    {
      id: '2', 
      text: '¿Qué tan seguido organizas tus tareas o actividades diarias?',
      type: 'multiple_choice',
      options: ['Diariamente', 'Algunas veces a la semana', 'Ocasionalmente', 'Rara vez o nunca'],
      required: true,
      order: 2
    },
    {
      id: '3',
      text: '¿Qué herramientas usas actualmente para organizarte?',
      type: 'multiple_choice', 
      options: ['Aplicaciones móviles', 'Agenda física', 'Notas digitales', 'No uso ninguna herramienta específica'],
      required: true,
      order: 3
    },
    {
      id: '4',
      text: '¿Qué tan importante es para ti tener recordatorios de tus tareas?',
      type: 'multiple_choice',
      options: ['Muy importante', 'Importante', 'Poco importante', 'No me importa'],
      required: true,
      order: 4
    },
    {
      id: '5',
      text: '¿Te gustaría que una aplicación te ayudara también a cuidar tu salud mental además de organizar tus tareas?',
      type: 'yes_no',
      required: true,
      order: 5
    },
    {
      id: '6',
      text: '¿Qué función te resultaría más útil en una app de organización?',
      type: 'multiple_choice',
      options: ['Recordatorios automáticos', 'Seguimiento de progreso', 'Consejos de productividad', 'Todas las anteriores'],
      required: true,
      order: 6
    },
    {
      id: '7',
      text: '¿En qué área sientes que necesitas más apoyo para organizarte?',
      type: 'multiple_choice',
      options: ['Trabajo', 'Estudios', 'Vida personal', 'Todas las áreas'],
      required: true,
      order: 7
    },
    {
      id: '8',
      text: '¿Con qué frecuencia revisarías la aplicación para gestionar tus actividades?',
      type: 'multiple_choice',
      options: ['Varias veces al día', 'Una vez al día', 'Algunas veces a la semana', 'Solo cuando sea necesario'],
      required: true,
      order: 8
    },
    {
      id: '9',
      text: '¿Te motivaría recibir mensajes o notificaciones con consejos de productividad y bienestar?',
      type: 'yes_no',
      required: true,
      order: 9
    },
    {
      id: '10',
      text: '¿Te gustaría poder personalizar el diseño y modo de la aplicación según tu estilo o estado de ánimo?',
      type: 'yes_no',
      required: true,
      order: 10
    },
    {
      id: '11',
      text: 'Si esta aplicación existiera, ¿la recomendarías a otras personas?',
      type: 'multiple_choice',
      options: ['Definitivamente sí', 'Probablemente sí', 'Tal vez', 'Probablemente no'],
      required: true,
      order: 11
    },
    {
      id: '12',
      text: 'Y finalmente... ¿Quieres salir conmigo?',
      type: 'special',
      required: true,
      order: 12
    }
  ]
}

async function createSession() {
  const { data, error } = await supabase
    .from('questionnaire_sessions')
    .insert({ completed: false })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return
  }

  sessionId.value = data?.id || ''
}

async function saveResponse(questionId: string, answer: string) {
  if (!sessionId.value) return

  const question = questions.value.find(q => q.id === questionId)
  if (!question) return

  const response = {
    session_id: sessionId.value,
    question_text: question.text,
    answer: answer,
    question_order: question.order
  }

  const { error } = await supabase
    .from('responses')
    .insert(response)

  if (error) {
    console.error('Error saving response:', error)
  }
}

async function completeSession(finalAnswer: string) {
  if (!sessionId.value) return

  // Get email from first question's answer
  const email = answers.value['1'] || ''

  const { error } = await supabase
    .from('questionnaire_sessions')
    .update({ 
      completed: true, 
      final_answer: finalAnswer,
      user_email: email
    })
    .eq('id', sessionId.value)

  if (error) {
    console.error('Error completing session:', error)
  }
  
  // Send email if the final answer is 'SI'
  if (finalAnswer === 'SI') {
    await sendEmail(email, answers.value, finalAnswer)
  }
}

async function handleAnswerSelected(answer: string) {
  currentAnswer.value = answer
  answers.value[currentQuestion.value.id] = answer
  
  // Auto advance to next question after short delay
  setTimeout(async () => {
    await nextQuestion()
  }, 800)
}

async function nextQuestion() {
  if (!hasAnswer.value || !currentQuestion.value) return

  await saveResponse(currentQuestion.value.id, currentAnswer.value)

  if (currentStep.value === questions.value.length - 1) {
    finalAnswer.value = currentAnswer.value
    await completeSession(currentAnswer.value)
    isCompleted.value = true
    return
  }

  currentStep.value++
  currentAnswer.value = answers.value[currentQuestion.value.id] || ''
}

function previousQuestion() {
  if (currentStep.value > 0) {
    currentStep.value--
    currentAnswer.value = answers.value[currentQuestion.value.id] || ''
  }
}

async function restartQuestionnaire() {
  currentStep.value = 0
  answers.value = {}
  currentAnswer.value = ''
  isCompleted.value = false
  finalAnswer.value = ''
  await createSession()
}

async function sendEmail(email: string, responses: Record<string, string>, finalAnswer: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        responses: responses,
        finalAnswer: finalAnswer
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

onMounted(async () => {
  await loadQuestions()
  await createSession()
})
</script>

<style scoped>
.questionnaire {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.question-wrapper {
  margin-bottom: 2rem;
}

.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 0 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
  transform: translateY(-2px);
}

.completion-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.completion-card {
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.success-title {
  color: #10b981;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.neutral-title {
  color: #1f2937;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.success-message {
  color: #374151;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.neutral-message {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

@media (max-width: 640px) {
  .questionnaire {
    padding: 1rem 0;
  }
  
  .navigation {
    padding: 0 1rem;
  }
  
  .completion-card {
    padding: 2rem 1.5rem;
    margin: 0 1rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
  
  .neutral-title {
    font-size: 1.5rem;
  }
}
</style>