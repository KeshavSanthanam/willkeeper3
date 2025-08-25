"use client"

import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"
import "./recorder.css"

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
		if (!recordingState.isRecording) return "status-ready"
		if (recordingState.isPaused) return "status-paused"
		return "status-recording"
	}

	return (
		<div className="container">
			<div className="card">
				<header className="header">
					<h1 className="title">Productivity Recorder</h1>
					<p className="subtitle">Self-accountability through screen and webcam recording</p>
				</header>

				<div className="recording-panel">
					<div className="status-section">
						<div className={`status-indicator ${getStatusColor()}`}>
							<div
								className={`status-dot ${recordingState.isRecording && !recordingState.isPaused ? "recording" : ""}`}
							></div>
							<span>{getRecordingStatus()}</span>
						</div>

						<div className="duration-display">
							<span className="duration-label">Duration:</span>
							<span className="duration-time">{formatDuration(recordingState.duration)}</span>
						</div>

						{recordingState.sessionId && (
							<div className="session-info">
								<span className="session-label">Session ID:</span>
								<span className="session-id">{recordingState.sessionId.slice(0, 8)}...</span>
							</div>
						)}
					</div>

					<div className="controls">
						{!recordingState.isRecording ? (
							<button className="btn btn-start" onClick={handleStartRecording}>
								<span className="btn-icon">●</span>
								Start Recording
							</button>
						) : (
							<div className="btn-group">
								{recordingState.isPaused ? (
									<button className="btn btn-resume" onClick={handleResumeRecording}>
										<span className="btn-icon">▶</span>
										Resume
									</button>
								) : (
									<button className="btn btn-pause" onClick={handlePauseRecording}>
										<span className="btn-icon">⏸</span>
										Pause
									</button>
								)}

								<button className="btn btn-stop" onClick={handleStopRecording}>
									<span className="btn-icon">⏹</span>
									Stop Recording
								</button>
							</div>
						)}
					</div>

					{error && (
						<div className="error-message">
							<span className="error-icon">⚠</span>
							{error}
						</div>
					)}
				</div>

				<div className="info-panel">
					<h3 className="info-title">Recording Information</h3>
					<ul className="info-list">
						<li>• Records all monitors simultaneously</li>
						<li>• Captures webcam footage</li>
						<li>• Combines all sources into single video file</li>
						<li>• Session data saved locally for compliance review</li>
					</ul>
				</div>
			</div>
		</div>
	)
}
