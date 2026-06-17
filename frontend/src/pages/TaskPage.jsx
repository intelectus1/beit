import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'

export default function TaskPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [mySubmission, setMySubmission] = useState(null)
  const [submitContent, setSubmitContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [grading, setGrading] = useState({})

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then((res) => setTask(res.data))
      .catch(() => navigate(-1))
      .finally(() => setLoading(false))

    if (isTeacher) {
      api.get(`/tasks/${id}/submissions`).then((res) => setSubmissions(res.data))
    } else {
      api.get(`/tasks/${id}/my-submission`)
        .then((res) => setMySubmission(res.data))
        .catch(() => {})
    }
  }, [id, isTeacher])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!submitContent.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/tasks/${id}/submit`, { content: submitContent })
      setMySubmission(data)
      toast.success('Tarea enviada exitosamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al enviar la tarea')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGrade(submissionId, score, feedback) {
    setGrading((g) => ({ ...g, [submissionId]: true }))
    try {
      const { data } = await api.put(`/tasks/submissions/${submissionId}/grade`, {
        score: Number(score),
        feedback,
      })
      setSubmissions((subs) => subs.map((s) => (s.id === submissionId ? data : s)))
      toast.success('Calificación guardada')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al calificar')
    } finally {
      setGrading((g) => ({ ...g, [submissionId]: false }))
    }
  }

  if (loading) return <div className="text-center py-16 text-zinc-400">Cargando...</div>
  if (!task) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* Task info */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{task.title}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              Entrega: {new Date(task.dueDate).toLocaleString('es-PE')}
            </span>
          )}
          <span>Puntaje máx: {task.maxScore}</span>
        </div>
        <div className="text-zinc-300 whitespace-pre-wrap">{task.description}</div>
      </div>

      {/* Student submission */}
      {!isTeacher && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Mi entrega</h2>
          {mySubmission ? (
            <div>
              <div className="bg-zinc-800/60 rounded-lg p-4 mb-4">
                <p className="text-zinc-300 whitespace-pre-wrap">{mySubmission.content}</p>
              </div>
              <div
                className={`flex items-center gap-2 text-sm font-medium ${
                  mySubmission.status === 'GRADED' ? 'text-green-400' : 'text-yellow-400'
                }`}
              >
                <CheckCircle size={16} />
                {mySubmission.status === 'GRADED' ? (
                  <span>
                    Calificado: {mySubmission.score}/{task.maxScore}
                    {mySubmission.feedback && (
                      <span className="text-zinc-400 font-normal ml-2">— {mySubmission.feedback}</span>
                    )}
                  </span>
                ) : (
                  <span>Entregado — pendiente de calificación</span>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                rows={6}
                required
                value={submitContent}
                onChange={(e) => setSubmitContent(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y transition-colors"
                placeholder="Escribe tu respuesta aquí..."
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Enviando...' : 'Enviar tarea'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Teacher: all submissions */}
      {isTeacher && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Entregas ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No hay entregas aún</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  sub={sub}
                  task={task}
                  onGrade={handleGrade}
                  loading={grading[sub.id]}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubmissionCard({ sub, task, onGrade, loading }) {
  const [score, setScore] = useState(sub.score ?? '')
  const [feedback, setFeedback] = useState(sub.feedback ?? '')

  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-800/30">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{sub.student.name}</span>
        <span className="text-xs text-zinc-500">
          {new Date(sub.submittedAt).toLocaleString('es-PE')}
        </span>
      </div>
      <div className="bg-zinc-800/60 rounded-lg p-3 mb-3 text-sm text-zinc-300 whitespace-pre-wrap">
        {sub.content}
      </div>
      {sub.status === 'GRADED' ? (
        <div className="text-green-400 text-sm font-medium flex items-center gap-1">
          <CheckCircle size={14} /> Calificado: {sub.score}/{task.maxScore}
          {sub.feedback && (
            <span className="text-zinc-400 font-normal ml-2">— {sub.feedback}</span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={task.maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-20 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 [color-scheme:dark]"
            placeholder="Pts"
          />
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Comentario (opcional)"
          />
          <button
            onClick={() => onGrade(sub.id, score, feedback)}
            disabled={loading || score === ''}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {loading ? '...' : 'Calificar'}
          </button>
        </div>
      )}
    </div>
  )
}
