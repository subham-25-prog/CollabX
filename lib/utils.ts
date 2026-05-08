import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | number | any) {
  if (!date) return 'Just now'
  
  // Handle Firestore Timestamp
  const d = date?.toDate ? date.toDate() : new Date(date)
  
  if (isNaN(d.getTime())) return 'Just now'

  const diffInDays = Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays > 7) {
    return format(d, 'MMM d, yyyy')
  }
  
  return formatDistanceToNow(d, { addSuffix: true })
    .replace('about ', '')
    .replace('less than a minute ago', 'just now')
}

export function getStringColor(str: string) {
  const colors = [
    'text-blue-500',
    'text-purple-500',
    'text-pink-500',
    'text-indigo-500',
    'text-cyan-500',
    'text-teal-500',
    'text-emerald-500',
    'text-orange-500',
  ]
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}
