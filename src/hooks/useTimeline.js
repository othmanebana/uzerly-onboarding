import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getActivityLog, logActivity, updateStepDates } from '../lib/timelineQueries'
import { addDays, startOfDay, buildDayColumns, getStepDates } from '../lib/timelineUtils'

const COL_WIDTH_DAY  = 52  // px per day column
const COL_WIDTH_WEEK = 120 // px per week column

export function useTimeline(client) {
  const [mode,       setMode]       = useState('day')   // 'day' | 'week' | 'month'
  const [scrollDate, setScrollDate] = useState(null)    // leftmost visible date
  const [steps,      setSteps]      = useState([])
  const [activityLog, setLog]       = useState([])
  const [logLoading,  setLogLoad]   = useState(false)
  const [filterUser,  setFilterUser] = useState('Tous')
  const [showLog,     setShowLog]   = useState(false)
  const [expandedStep, setExpandedStep] = useState(null)

  // Initialise steps from client
  useEffect(() => {
    if (!client?.steps) return
    setSteps(client.steps)
    // Default scroll to J0 - 2 days
    if (client.created_at) {
      const j0 = startOfDay(new Date(client.created_at))
      setScrollDate(addDays(j0, -2))
    }
  }, [client?.id])

  // Load activity log
  const loadLog = useCallback(async () => {
    if (!client?.id) return
    setLogLoad(true)
    try {
      const data = await getActivityLog(client.id)
      setLog(data)
    } catch (err) { console.error(err) }
    finally { setLogLoad(false) }
  }, [client?.id])

  useEffect(() => { if (showLog) loadLog() }, [showLog, loadLog])

  // Column width
  const colWidth = mode === 'week' ? COL_WIDTH_WEEK : COL_WIDTH_DAY

  // Visible date range: J0 - 3 days to J14 + 7 days, minimum 30 cols
  const { rangeStart, rangeEnd, columns } = useMemo(() => {
    if (!client?.created_at) return { rangeStart: new Date(), rangeEnd: addDays(new Date(), 30), columns: [] }
    const j0   = startOfDay(new Date(client.created_at))
    const start = addDays(j0, -3)
    const end   = addDays(j0, 30)
    return {
      rangeStart: start,
      rangeEnd:   end,
      columns:    buildDayColumns(start, end),
    }
  }, [client?.created_at])

  // Step computed dates
  const stepsWithDates = useMemo(() => {
    if (!client?.created_at) return steps
    return steps.map(step => ({
      ...step,
      _dates: getStepDates(step, client.created_at),
    }))
  }, [steps, client?.created_at])

  // Unique users for filter
  const allUsers = useMemo(() => {
    const users = new Set(['Tous'])
    activityLog.forEach(e => users.add(e.user_name))
    return [...users]
  }, [activityLog])

  const filteredLog = useMemo(() => {
    if (filterUser === 'Tous') return activityLog
    return activityLog.filter(e => e.user_name === filterUser)
  }, [activityLog, filterUser])

  // Update a step's dates (optimistic + persist)
  async function updateDates(stepId, dates, userName = 'Système') {
    // Optimistic
    setSteps(prev => prev.map(s => s.id === stepId ? { ...s, ...dates } : s))
    const step = steps.find(s => s.id === stepId)
    if (!step) return
    try {
      await updateStepDates(stepId, dates, client.id, step.step_number, userName)
      // Reload log
      if (showLog) loadLog()
    } catch (err) {
      console.error('updateDates error:', err)
      setSteps(prev => prev.map(s => s.id === stepId ? step : s)) // rollback
    }
  }

  // Drag: move a block → update planned_start + planned_end by delta days
  function dragStep(stepId, deltaDays, userName) {
    const step = steps.find(s => s.id === stepId)
    if (!step || !step._dates) return
    const { plannedStart, plannedEnd } = step._dates
    const newStart = addDays(plannedStart, deltaDays)
    const newEnd   = addDays(plannedEnd,   deltaDays)
    updateDates(stepId, {
      planned_start: newStart.toISOString().split('T')[0],
      planned_end:   newEnd.toISOString().split('T')[0],
    }, userName)
  }

  // Log a custom activity entry
  async function addLog(entry) {
    await logActivity({ client_id: client.id, ...entry })
    if (showLog) loadLog()
  }

  return {
    mode, setMode,
    colWidth,
    scrollDate, setScrollDate,
    rangeStart, rangeEnd, columns,
    steps: stepsWithDates,
    setSteps,
    activityLog: filteredLog,
    allUsers,
    logLoading,
    filterUser, setFilterUser,
    showLog, setShowLog,
    expandedStep, setExpandedStep,
    updateDates,
    dragStep,
    addLog,
    loadLog,
    COL_WIDTH_DAY,
  }
}
