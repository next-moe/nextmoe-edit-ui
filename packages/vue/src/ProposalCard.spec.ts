import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProposalCard from './ProposalCard.vue'
import type { EditProposal } from './types'

const proposal = (patch: Record<string, unknown>): EditProposal => ({
  id: 7,
  entity_type: 'catalog.work',
  entity_id: 1,
  base_revision_seq: 4,
  patch,
  proposer_uid: 1,
  note: '',
  site: 'kungal',
  status: 'open',
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-01T00:00:00Z'
})

const labelFor = (key: string) => ({ 'catalog.work.titles': '标题' })[key] ?? key

describe('ProposalCard — drift', () => {
  it('calls out only the drifted fields this patch actually touches', () => {
    const w = mount(ProposalCard, {
      props: {
        proposal: proposal({ 'catalog.work.titles': [] }),
        labelFor,
        currentRevisionSeq: 9,
        conflictKeys: ['catalog.work.titles', 'catalog.work.intros']
      }
    })

    expect(w.text()).toContain('存在冲突')
    expect(w.text()).toContain('标题')
    expect(w.text()).not.toContain('catalog.work.intros')
  })

  it('treats a stale base with untouched fields as a warning, not a conflict', () => {
    const w = mount(ProposalCard, {
      props: {
        proposal: proposal({ 'catalog.work.titles': [] }),
        labelFor,
        currentRevisionSeq: 9,
        conflictKeys: ['catalog.work.intros']
      }
    })

    expect(w.text()).not.toContain('存在冲突')
    expect(w.text()).toContain('基于第 4 版')
    expect(w.text()).toContain('仍可正常合并')
  })

  it('says nothing when the proposal is on the head revision', () => {
    const w = mount(ProposalCard, {
      props: {
        proposal: proposal({ 'catalog.work.titles': [] }),
        labelFor,
        currentRevisionSeq: 4
      }
    })

    expect(w.text()).not.toContain('存在冲突')
    expect(w.text()).not.toContain('基于第')
  })
})
