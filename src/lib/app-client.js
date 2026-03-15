// Google Gemini integration via the official @google/generative-ai SDK
import { GoogleGenerativeAI } from '@google/generative-ai'

const STORAGE_PREFIX = 'maia'

const STORAGE_KEYS = {
	user: `${STORAGE_PREFIX}:user`,
	contacts: `${STORAGE_PREFIX}:contacts`,
	contractions: `${STORAGE_PREFIX}:contractions`,
	symptomLogs: `${STORAGE_PREFIX}:symptom-logs`,
	notifications: `${STORAGE_PREFIX}:notifications`,
}

const defaultUser = {
	id: 'demo-user',
	full_name: 'Demo Parent',
	email: 'demo@maia.app',
	mom_name: 'Demo Parent',
	baby_name: 'Baby',
	role: 'member',
	onboarding_completed: false,
	labor_safe_word: '',
}

function clone(value) {
	if (typeof structuredClone === 'function') {
		return structuredClone(value)
	}

	return JSON.parse(JSON.stringify(value))
}

function readStorage(key, fallback) {
	if (typeof window === 'undefined') {
		return clone(fallback)
	}

	const rawValue = window.localStorage.getItem(key)
	if (!rawValue) {
		return clone(fallback)
	}

	try {
		return JSON.parse(rawValue)
	} catch {
		return clone(fallback)
	}
}

function writeStorage(key, value) {
	if (typeof window === 'undefined') {
		return clone(value)
	}

	window.localStorage.setItem(key, JSON.stringify(value))
	return clone(value)
}

function removeStorage(key) {
	if (typeof window !== 'undefined') {
		window.localStorage.removeItem(key)
	}
}

function makeId(prefix) {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return `${prefix}-${crypto.randomUUID()}`
	}

	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function sortItems(items, sortBy = '-created_date', limit) {
	const direction = sortBy.startsWith('-') ? -1 : 1
	const fieldName = sortBy.replace(/^-/, '')
	const sortedItems = [...items].sort((leftItem, rightItem) => {
		const leftValue = leftItem[fieldName] ?? ''
		const rightValue = rightItem[fieldName] ?? ''

		if (leftValue < rightValue) {
			return -1 * direction
		}

		if (leftValue > rightValue) {
			return 1 * direction
		}

		return 0
	})

	if (typeof limit === 'number') {
		return sortedItems.slice(0, limit)
	}

	return sortedItems
}

function createEntityStore(storageKey, prefix) {
	return {
		async list(sortBy = '-created_date', limit) {
			const items = readStorage(storageKey, [])
			return sortItems(items, sortBy, limit)
		},

		async create(data) {
			const items = readStorage(storageKey, [])
			const nextItem = {
				id: makeId(prefix),
				created_date: new Date().toISOString(),
				...data,
			}

			items.push(nextItem)
			writeStorage(storageKey, items)
			return clone(nextItem)
		},

		async delete(id) {
			const items = readStorage(storageKey, [])
			const filteredItems = items.filter((item) => item.id !== id)
			writeStorage(storageKey, filteredItems)
			return { success: true }
		},
	}
}



/**
 * Convert a URL (blob: or https:) to a Gemini-compatible inline image part.
 * Fetches the resource and encodes it as base64.
 *
 * @param {string} url
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
async function urlToInlinePart(url) {
	const response = await fetch(url)
	const buffer   = await response.arrayBuffer()
	const base64   = btoa(String.fromCharCode(...new Uint8Array(buffer)))
	const mimeType = response.headers.get('content-type') || 'image/jpeg'
	return { inlineData: { data: base64, mimeType } }
}

/**
 * Send a prompt (and optional image URLs) to Gemini and return the reply text.
 *
 * @param {string}   prompt    - The user message.
 * @param {string[]} file_urls - Optional image URLs for multimodal analysis.
 * @returns {Promise<string>}
 */
async function callGemini(prompt, file_urls = []) {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY
	if (!apiKey) {
		return 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
	}

	console.log('[MAIA] Sending request to Gemini...')

	try {
		const genAI = new GoogleGenerativeAI(apiKey)
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

		// Build the content parts: text prompt + any inline images
		const parts = [{ text: `${SYSTEM_PROMPT}\n\nUser: ${prompt}` }]

		if (file_urls.length > 0) {
			const imageParts = await Promise.all(file_urls.map(urlToInlinePart))
			parts.push(...imageParts)
		}

		const result = await model.generateContent(parts)
		const text   = result.response.text()
		console.log('[MAIA] Gemini response received.')
		return text
	} catch (error) {
		console.error('[MAIA] Gemini API error:', error)
		return "I'm having trouble reaching my AI service right now. Please try again."
	}
}

const SYSTEM_PROMPT = `
You are MAIA (Maternal Artificial Intelligence Assistant), a calm and supportive AI doula designed to assist pregnant and postpartum mothers.

ROLE
Provide guidance, education, emotional support, and early warning awareness during pregnancy, labor, and postpartum recovery.

COMMUNICATION STYLE

* Speak clearly and calmly.
* Keep responses short and easy to understand.
* Avoid complex medical terminology.
* Ask gentle follow-up questions when helpful.
* Be supportive and reassuring.

SAFETY RULES
You are not a doctor and you do not diagnose medical conditions.

If a user reports symptoms such as:
heavy bleeding, severe headache, vision loss, chest pain, fainting, severe abdominal pain, high fever, or reduced baby movement

you must clearly recommend seeking immediate medical care.

Always prioritize the user's safety.

LABOR SUPPORT
If the user asks about labor or contractions:

* Explain the 5-1-1 rule (contractions every 5 minutes, lasting 1 minute, for 1 hour).
* Suggest breathing techniques and staying calm.
* Encourage contacting a healthcare professional when labor becomes consistent.

POSTPARTUM SUPPORT
Provide supportive responses for:
postpartum recovery, emotional stress, anxiety, breastfeeding concerns, and general recovery.

If the user expresses severe depression or thoughts of self-harm, advise contacting a healthcare professional or support service immediately.

ADVOCACY SUPPORT
Encourage users to ask questions and advocate for themselves in healthcare settings. Help them prepare questions for doctors or midwives.

RESPONSE STYLE

1. Acknowledge the concern
2. Provide short guidance
3. Suggest when to contact a healthcare professional

Always maintain a calm and empathetic tone.
`

export const appClient = {
	auth: {
		async me() {
			return readStorage(STORAGE_KEYS.user, defaultUser)
		},

		async updateMe(partialUser) {
			const nextUser = {
				...readStorage(STORAGE_KEYS.user, defaultUser),
				...partialUser,
			}

			writeStorage(STORAGE_KEYS.user, nextUser)
			return clone(nextUser)
		},

		logout() {
			removeStorage(STORAGE_KEYS.user)
			writeStorage(STORAGE_KEYS.user, defaultUser)
			if (typeof window !== 'undefined') {
				window.location.assign('/')
			}
		},

		redirectToLogin() {
			if (typeof window !== 'undefined') {
				window.location.assign('/')
			}
		},
	},

	entities: {
		Contact: createEntityStore(STORAGE_KEYS.contacts, 'contact'),
		Contraction: createEntityStore(STORAGE_KEYS.contractions, 'contraction'),
		SymptomLog: createEntityStore(STORAGE_KEYS.symptomLogs, 'symptom'),
	},

	integrations: {
		Core: {
			async InvokeLLM({ prompt, file_urls = [] }) {
				// Passes file_urls through to callGemini for multimodal (CameraInput) support
				return callGemini(prompt, file_urls)
			},

			async UploadFile({ file }) {
				return {
					file_url: typeof window !== 'undefined' ? URL.createObjectURL(file) : file?.name ?? '',
				}
			},

			async SendEmail({ to, subject, body, from_name }) {
				const notifications = readStorage(STORAGE_KEYS.notifications, [])
				notifications.push({
					id: makeId('notification'),
					to,
					subject,
					body,
					from_name,
					created_date: new Date().toISOString(),
				})
				writeStorage(STORAGE_KEYS.notifications, notifications)
				return { success: true }
			},
		},
	},
}