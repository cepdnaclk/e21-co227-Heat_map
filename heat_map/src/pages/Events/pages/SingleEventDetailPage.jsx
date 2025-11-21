import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SingleEventdetailPage.css';

import ClockIcon from '../icons/clock.svg';
import LocationIcon from '../icons/location.svg';
import StarIcon from '../icons/star.svg';
import RateIcon from '../icons/rate.svg';
import ArrowLeftIcon from '../icons/arrow-left.svg';

const API_BASE_URL = 'http://localhost:3036';

export default function SingleEventDetailPage() {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const [isInterested, setIsInterested] = useState(false);
    const [interestPending, setInterestPending] = useState(false);

    const { id } = useParams();
    const eventId = Number.isNaN(Number(id)) ? null : Number(id);

    const interestedReqIdRef = useRef(0);

    // Fetch event details
    useEffect(() => {
        if (eventId == null) {
            setError('Invalid event ID.');
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                    credentials: 'include',
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
                const data = await response.json();
                setEvent(data);
                setError(null);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to fetch event details:', err);
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [eventId]);

    // Fetch event status
    useEffect(() => {
        if (eventId == null) return;
        const controller = new AbortController();

        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/status`, {
                    credentials: 'include',
                    signal: controller.signal,
                });
                if (!response.ok) return;
                const data = await response.json();
                setStatus(data.status);
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Failed to fetch event status:', err);
            }
        })();

        return () => controller.abort();
    }, [eventId]);

    // Fetch interested status
    useEffect(() => {
        if (eventId == null) return;
        const controller = new AbortController();
        const reqId = ++interestedReqIdRef.current;

        (async () => {
            try {
                const resp = await fetch(`${API_BASE_URL}/api/interested/status/${eventId}`, {
                    credentials: 'include',
                    signal: controller.signal,
                });
                if (!resp.ok) return;
                const json = await resp.json();
                if (reqId === interestedReqIdRef.current) {
                    setIsInterested(Boolean(json.interested));
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error('Failed to fetch interested status:', e);
            }
        })();

        return () => controller.abort();
    }, [eventId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return new Date(dateString).toLocaleString('en-US', options);
    };

    const toggleDescription = () => setIsDescriptionExpanded((v) => !v);

    const handleToggleInterested = async () => {
        if (!event || interestPending || eventId == null) return;
        setInterestPending(true);

        const prevInterested = isInterested;
        const prevCount = Number(event.interested_count) || 0;
        const nextInterested = !prevInterested;
        const nextCount = Math.max(prevCount + (nextInterested ? 1 : -1), 0);

        setIsInterested(nextInterested);
        setEvent((e) => (e ? { ...e, interested_count: nextCount } : e));

        const reqId = ++interestedReqIdRef.current;

        try {
            if (nextInterested) {
                const resp = await fetch(`${API_BASE_URL}/api/interested`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ event_id: eventId }),
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const json = await resp.json().catch(() => null);

                if (reqId === interestedReqIdRef.current && json?.interested_count != null) {
                    setEvent((e) => (e ? { ...e, interested_count: json.interested_count } : e));
                }
            } else {
                const resp = await fetch(`${API_BASE_URL}/api/interested`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ event_id: eventId }),
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const json = await resp.json().catch(() => null);

                if (reqId === interestedReqIdRef.current && json?.interested_count != null) {
                    setEvent((e) => (e ? { ...e, interested_count: json.interested_count } : e));
                }
            }
        } catch (err) {
            console.error('Failed to toggle interested:', err);
            if (reqId === interestedReqIdRef.current) {
                setIsInterested(prevInterested);
                setEvent((e) => (e ? { ...e, interested_count: prevCount } : e));
                alert('Sorry, something went wrong. Please try again.');
            }
        } finally {
            if (reqId === interestedReqIdRef.current) {
                setInterestPending(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-text">Error: Failed to fetch event. Please check the backend server.</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="not-found-container">
                <div className="not-found-text">Event not found.</div>
            </div>
        );
    }

    const startDate = formatDate(event.start_time);
    const endDate = formatDate(event.end_time);
    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || 'N/A';

    return (
        <div className="event-detail-container">
            {/* Mobile Navigation Bar */}
            <div className="mobile-nav-bar">
                <Link to="/" className="mobile-back-button">
                    <img src={ArrowLeftIcon} alt="Back" className="mobile-back-icon" />
                </Link>
                <h2 className="mobile-nav-title">Details</h2>
                <div className="mobile-nav-spacer"></div>
            </div>

            <div className="event-content full-width">
                <div className="event-left-section">
                    <Link to="/" className="back-button">
                        <img src={ArrowLeftIcon} alt="Back" className="back-icon" />
                        Back
                    </Link>

                    <div className="event-header">
                        <div className="event-title-row">
                            <h1 className="event-title">{event.event_title}</h1>
                            {status && (
                                <span className={`event-status ${status.toLowerCase()}`}>
                                    {status}
                                </span>
                            )}
                        </div>

                        <div className="event-description-container">
                            <p className={`event-description ${isDescriptionExpanded ? 'expanded' : ''}`}>
                                {event.description}
                            </p>
                            <button className="description-toggle" onClick={toggleDescription}>
                                {isDescriptionExpanded ? 'Less' : 'More'}
                            </button>
                        </div>
                    </div>

                    <button
                        className={`interested-button ${isInterested ? 'active' : ''}`}
                        onClick={handleToggleInterested}
                        disabled={interestPending}
                        aria-pressed={isInterested}
                    >
                        <img src={StarIcon} alt="" className="interested-icon" />
                        Interested
                    </button>

                    <div className="event-details">
                        <div className="detail-item">
                            <img src={ClockIcon} alt="Time" className="detail-icon" />
                            <div className="detail-content">
                                <div className="detail-value">{dateRange}</div>
                            </div>
                        </div>

                        <div className="detail-item">
                            <img src={LocationIcon} alt="Location" className="detail-icon" />
                            <div className="detail-content">
                                <div className="detail-value">{event.location}</div>
                            </div>
                        </div>

                        <div className="detail-item">
                            <img src={StarIcon} alt="Interested" className="detail-icon" />
                            <div className="detail-content">
                                <div className="detail-value">
                                    {Number(event.interested_count) || 0} People Interested
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rate Event button -> FeedbackPage */}
                    <Link to={`/events/${eventId}/feedback`} className="rate-button">
                        <img src={RateIcon} alt="Rate" className="rate-icon" />
                        Rate Event
                    </Link>
                </div>
            </div>
        </div>
    );
}
