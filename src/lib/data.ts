export interface Event {
  id: string
  date: string // YYYY-MM-DD
  title: string
  description: string
}

export const events: Event[] = [
  {
    id: '1',
    date: '2024-04-15',
    title: 'Sample Event 1',
    description: 'Description for event 1'
  },
  {
    id: '2',
    date: '2024-04-20',
    title: 'Sample Event 2',
    description: 'Description for event 2'
  }
]

export const hours = {
  weekdays: "Monday to Wednesday: 10:00am - 2:00am",
  weekends: "Thursday to Sunday: 10:00am - 3:00am"
}