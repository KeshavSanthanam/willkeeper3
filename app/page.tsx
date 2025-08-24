"use client"

import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"

interface RecordingState {
	isRecording: boolean
	isPaused: boolean
	duration: number
	sessionId: string | null
}

export default function ProductivityRecorder() {
	const [recordingState, setRecordingState] = useState<RecordingState>({
		isRecording: false,
		isPaused: false,
		duration: 0,
		sessionId: null,
	})
	const [error, setError] = useState<string | null>(null)

	// Timer for recording duration
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		if (recordingState.isRecording && !recordingState.isPaused) {
			interval = setInterval(() => {
				setRecordingState((prev) => ({
					...prev,
					duration: prev.duration + 1,
				}))
			}, 1000)
		}

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [recordingState.isRecording, recordingState.isPaused])

	const formatDuration = (seconds: number): string => {
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		const secs = seconds % 60
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
	}

	const handleStartRecording = async () => {
		try {
			setError(null)
			const sessionId = await invoke<string>("start_recording")
			setRecordingState({
				isRecording: true,
				isPaused: false,
				duration: 0,
				sessionId,
			})
		} catch (err) {
			setError(`Failed to start recording: ${err}`)
			console.error("Start recording error:", err)
		}
	}

	const handlePauseRecording = async () => {
		try {
			setError(null)
			await invoke("pause_recording", { sessionId: recordingState.sessionId })
			setRecordingState((prev) => ({
				...prev,
				isPaused: true,
			}))
		} catch (err) {
			setError(`Failed to pause recording: ${err}`)
			console.error("Pause recording error:", err)
		}
	}

	const handleResumeRecording = async () => {
		try {
			setError(null)
			await invoke("resume_recording", { sessionId: recordingState.sessionId })
			setRecordingState((prev) => ({
				...prev,
				isPaused: false,
			}))
		} catch (err) {
			setError(`Failed to resume recording: ${err}`)
			console.error("Resume recording error:", err)
		}
	}

	const handleStopRecording = async () => {
		try {
			setError(null)
			await invoke("stop_recording", { sessionId: recordingState.sessionId })
			setRecordingState({
				isRecording: false,
				isPaused: false,
				duration: 0,
				sessionId: null,
			})
		} catch (err) {
			setError(`Failed to stop recording: ${err}`)
			console.error("Stop recording error:", err)
		}
	}

	const getRecordingStatus = () => {
		if (!recordingState.isRecording) return "Ready to Record"
		if (recordingState.isPaused) return "Recording Paused"
		return "Recording Active"
	}

	const getStatusColor = () => {
		if (!recordingState.isRecording) return "text-gray-600"
		if (recordingState.isPaused) return "text-yellow-600"
		return "text-red-600"
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-5">
			<div className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full">
				<header className="text-center mb-10">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">Productivity Recorder</h1>
					<p className="text-gray-600 text-lg">Self-accountability through screen and webcam recording</p>
				</header>

				<div className="bg-gray-50 rounded-xl p-8 mb-8 border-2 border-gray-200">
					<div className="flex flex-col items-center gap-4 mb-8">
						<div className={`flex items-center gap-3 text-xl font-semibold ${getStatusColor()}`}>
							<div
								className={`w-3 h-3 rounded-full bg-gray-300 transition-all duration-300 ${recordingState.isRecording && !recordingState.isPaused ? "bg-red-500 animate-pulse" : ""
									}`}
							></div>
							<span>{getRecordingStatus()}</span>
						</div>

						<div className="flex items-center gap-2 text-lg">
							<span className="text-gray-600">Duration:</span>
							<span className="font-mono font-bold text-gray-800 bg-gray-200 px-3 py-1 rounded-md">
								{formatDuration(recordingState.duration)}
							</span>
						</div>

						{recordingState.sessionId && (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-gray-600">Session ID:</span>
								<span className="font-mono bg-gray-200 px-2 py-1 rounded text-gray-700">
									{recordingState.sessionId.slice(0, 8)}...
								</span>
							</div>
						)}
					</div>

					<div className="flex justify-center">
						{!recordingState.isRecording ? (
							<button
								className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 min-w-36 justify-center"
								onClick={handleStartRecording}
							>
								<span className="text-xl">●</span>
								Start Recording
							</button>
						) : (
							<div className="flex gap-4">
								{recordingState.isPaused ? (
									<button
										className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 min-w-36 justify-center"
										onClick={handleResumeRecording}
									>
										<span className="text-xl">▶</span>
										Resume
									</button>
								) : (
									<button
										className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 min-w-36 justify-center"
										onClick={handlePauseRecording}
									>
										<span className="text-xl">⏸</span>
										Pause
									</button>
								)}

								<button
									className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all duration-200 hover:-translate-y-0.5 min-w-36 justify-center"
									onClick={handleStopRecording}
								>
									<span className="text-xl">⏹</span>
									Stop Recording
								</button>
							</div>
						)}
					</div>

					{error && (
						<div className="mt-5 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
							<span className="text-lg">⚠</span>
							{error}
						</div>
					)}
				</div>

				<div className="bg-gray-100 rounded-xl p-6">
					<h3 className="text-gray-800 mb-4 text-xl font-semibold">Recording Information</h3>
					<ul className="space-y-2">
						<li className="text-gray-700">• Records all monitors simultaneously</li>
						<li className="text-gray-700">• Captures webcam footage</li>
						<li className="text-gray-700">• Combines all sources into single video file</li>
						<li className="text-gray-700">• Session data saved locally for compliance review</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
