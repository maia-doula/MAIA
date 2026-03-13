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

function buildAiResponse(promptText) {
	const prompt = promptText.toLowerCase()

	if (/analyze this image|vision scan|photo analysis/.test(prompt)) {
		return [
			'I cannot diagnose from an image alone, but I can help you triage what to do next.',
			'Review: the photo should be checked for worsening redness, drainage, severe swelling, spreading rash, or increasing pain.',
			'Concern level: if symptoms are mild and stable, monitor closely. If they are worsening, call your provider today. Seek urgent care for rapidly spreading changes or severe pain. Seek emergency care for heavy bleeding, trouble breathing, chest pain, or fainting.',
			'Next step: compare with a photo from earlier, note fever or pain level, and contact a clinician if anything is escalating.',
		].join('\n\n')
	}

	if (/severe headache|vision changes|heavy bleeding|fever|emergency/.test(prompt)) {
		return 'Those symptoms can be dangerous in pregnancy or postpartum. Please seek urgent medical care now. If you have severe headache, vision changes, heavy bleeding, chest pain, shortness of breath, or you feel faint, call emergency services immediately.'
	}

	if (/contraction|labor/.test(prompt)) {
		return 'Track timing, duration, and intensity. If contractions are about 5 minutes apart, lasting about 1 minute, for 1 hour, it may be time to head in. Go sooner if your water breaks, bleeding increases, fetal movement drops, or you feel unsafe.'
	}

	if (/symptom|check|assess/.test(prompt)) {
		return 'I can help you organize what you are feeling, but I cannot diagnose. Note when symptoms started, whether they are getting worse, and whether you have red-flag signs like heavy bleeding, severe pain, fever, chest pain, shortness of breath, or severe headache. Mild stable symptoms can often be monitored, but worsening symptoms should be discussed with your provider.'
	}

	if (/postpartum|anxiety|depress|overwhelmed/.test(prompt)) {
		return 'What you are feeling matters. Rest, hydration, food, and support help, but persistent sadness, panic, hopelessness, or feeling unable to care for yourself or your baby should be discussed with a clinician promptly. If you might harm yourself or feel unsafe, call emergency services now.'
	}

	return 'I am here to help you think through what is happening. Tell me what symptoms you have, when they started, and whether they are getting better or worse. If anything feels severe, fast-changing, or unsafe, contact a clinician or seek urgent care.'
}

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
			async InvokeLLM({ prompt }) {
				return buildAiResponse(prompt)
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