import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { userService } from '../services/userService'

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      userService
        .getUserById(Number(id))
        .then((res) => {
          setName(res.data.name)
          setEmail(res.data.email)
        })
        .catch(() => setSubmitError('Failed to load user'))
    }
  }, [isEdit, id])

  function validate(): boolean {
    const next: { name?: string; email?: string; password?: string } = {}
    if (!name.trim()) next.name = 'Name is required'
    if (!email.trim()) next.email = 'Email is required'
    if (!isEdit && !password.trim()) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setLoading(true)
    if (isEdit && id) {
      userService
        .updateUser(Number(id), {
          name: name.trim(),
          email: email.trim(),
          ...(password.trim() && { password: password.trim() }),
        })
        .then(() => navigate('/'))
        .catch((err) =>
          setSubmitError(err.response?.data?.message || 'Failed to update user')
        )
        .finally(() => setLoading(false))
    } else {
      userService
        .createUser({ name: name.trim(), email: email.trim(), password: password.trim() })
        .then(() => navigate('/'))
        .catch((err) =>
          setSubmitError(err.response?.data?.message || 'Failed to create user')
        )
        .finally(() => setLoading(false))
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">
        {isEdit ? 'Edit User' : 'Add User'}
      </h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        {submitError && (
          <div className="p-3 rounded bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:border-gray-400"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:border-gray-400"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password {isEdit && <span className="text-gray-500 font-normal">(leave blank to keep current)</span>}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring focus:ring-gray-200 focus:border-gray-400"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
