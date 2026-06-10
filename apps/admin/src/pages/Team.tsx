import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { api } from '../lib/api'
import { t } from '../lib/i18n'
import { Layout } from '../components/Layout'
import { PageHeader } from '../components/PageHeader'
import { DataTable } from '../components/DataTable'
import { Modal } from '../components/Modal'
import { ROLES } from '@manzoom/config'

interface Member {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'مالك',
  admin: 'مدير',
  editor: 'محرر',
  fulfillment: 'شحن',
}

export function TeamPage({ storeSlug }: { storeSlug: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [form, setForm] = useState({ email: '', role: 'editor' })
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    api
      .get<{ members: Member[] }>(`/${storeSlug}/team`)
      .then((res) => setMembers(res.members))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [storeSlug])

  async function handleInvite(e: Event) {
    e.preventDefault()
    setError('')
    setInviting(true)
    try {
      const res = await api.post<{ member: Member }>(`/${storeSlug}/team/invite`, form)
      setMembers([...members, res.member as unknown as Member])
      setShowInvite(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviting(false)
    }
  }

  async function handleDelete(member: Member) {
    await api.delete(`/${storeSlug}/team/${member.id}`)
    setMembers(members.filter((m) => m.id !== member.id))
  }

  const columns = [
    { key: 'name', label: t('name') },
    { key: 'email', label: t('email') },
    {
      key: 'role',
      label: t('role'),
      render: (m: Member) => <span class="badge-gray">{ROLE_LABELS[m.role] ?? m.role}</span>,
    },
    { key: 'created_at', label: t('created_at'), render: (m: Member) => m.created_at.slice(0, 10) },
  ]

  return (
    <Layout storeSlug={storeSlug}>
      <div class="p-8">
        <PageHeader
          title={t('team')}
          actions={
            <button onClick={() => setShowInvite(true)} class="btn-primary">
              + {t('invite')}
            </button>
          }
        />

        <DataTable
          columns={columns as any}
          data={members}
          loading={loading}
          onDelete={handleDelete}
        />

        {showInvite && (
          <Modal
            title={t('invite')}
            onClose={() => setShowInvite(false)}
            footer={
              <>
                <button onClick={() => setShowInvite(false)} class="btn-secondary">{t('cancel')}</button>
                <button onClick={handleInvite} class="btn-primary" disabled={inviting}>
                  {inviting ? t('loading') : t('invite')}
                </button>
              </>
            }
          >
            <form onSubmit={handleInvite} class="space-y-4">
              <div>
                <label class="label">{t('email')}</label>
                <input
                  class="input"
                  type="email"
                  value={form.email}
                  onInput={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
                  required
                />
              </div>
              <div>
                <label class="label">{t('role')}</label>
                <select
                  class="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: (e.target as HTMLSelectElement).value })}
                >
                  {ROLES.filter((r) => r !== 'owner').map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                  ))}
                </select>
              </div>
              {error && (
                <div class="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
