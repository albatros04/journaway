"use client";

import { useEffect, useState } from "react";

type DriverTrip = { id: string; pickupLocation: string; dropoffLocation: string; pickupAt: string; travellerName: string; status: "assigned" | "en_route" | "completed" | "cancelled" };
type HotelBooking = { booking: { id: string; bookingReference: string; guestName: string; checkInDate: string; checkOutDate: string; status: "confirmed" | "checked_in" | "checked_out" | "cancelled" }; property: { name: string }; room: { name: string } | null };
type Property = { property: { id: string; name: string; destination: string; city: string; address: string | null; contactPhone: string | null } };
type Room = { id: string; name: string; category: string; inventory: number; propertyId: string };

const driverNext = { assigned: "en_route", en_route: "completed" } as const;
const hotelNext = { confirmed: "checked_in", checked_in: "checked_out" } as const;

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload;
}

export function DriverTripsDashboard() {
  const [trips, setTrips] = useState<DriverTrip[]>([]); const [message, setMessage] = useState("Loading your trips…");
  const load = () => requestJson<{ trips: DriverTrip[]; profileReady: boolean }>("/api/driver/trips").then(data => { setTrips(data.trips); setMessage(data.profileReady ? "" : "Complete your driver profile before operations can assign a trip."); }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load trips."));
  useEffect(() => { load(); }, []);
  const advance = async (trip: DriverTrip) => { const status = driverNext[trip.status as keyof typeof driverNext]; if (!status) return; try { await requestJson(`/api/driver/trips/${trip.id}`, { method: "PATCH", body: JSON.stringify({ status }) }); load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update trip."); } };
  return <section className="operations-records"><p className="eyebrow">Assigned trips</p>{message && <p className="operations-notice">{message}</p>}{trips.map(trip => <article key={trip.id}><div><strong>{trip.pickupLocation} → {trip.dropoffLocation}</strong><span>{new Date(trip.pickupAt).toLocaleString()} · {trip.travellerName}</span></div><div><em>{trip.status.replace("_", " ")}</em>{driverNext[trip.status as keyof typeof driverNext] && <button onClick={() => advance(trip)}>Mark {driverNext[trip.status as keyof typeof driverNext].replace("_", " ")}</button>}</div></article>)}{!message && !trips.length && <p className="operations-notice">No trips are assigned to this driver.</p>}</section>;
}

export function DriverProfileManager() {
  const [message, setMessage] = useState("Loading profile…"); const [phone, setPhone] = useState(""); const [vehicleRegistration, setVehicleRegistration] = useState(""); const [vehicleType, setVehicleType] = useState("");
  useEffect(() => { requestJson<{ profile: { phone: string | null; vehicleRegistration: string | null; vehicleType: string | null } | null }>("/api/driver/profile").then(data => { setPhone(data.profile?.phone ?? ""); setVehicleRegistration(data.profile?.vehicleRegistration ?? ""); setVehicleType(data.profile?.vehicleType ?? ""); setMessage(""); }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load profile.")); }, []);
  const save = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); try { await requestJson("/api/driver/profile", { method: "PUT", body: JSON.stringify({ phone, vehicleRegistration, vehicleType }) }); setMessage("Profile saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save profile."); } };
  return <form className="operations-form" onSubmit={save}><label>Phone<input value={phone} onChange={event => setPhone(event.target.value)} /></label><label>Vehicle registration<input value={vehicleRegistration} onChange={event => setVehicleRegistration(event.target.value)} /></label><label>Vehicle type<input value={vehicleType} onChange={event => setVehicleType(event.target.value)} /></label><button className="button button-primary" type="submit">Save profile</button>{message && <p className="operations-notice">{message}</p>}</form>;
}

export function HotelStaysDashboard() {
  const [bookings, setBookings] = useState<HotelBooking[]>([]); const [message, setMessage] = useState("Loading property stays…");
  const load = () => requestJson<{ bookings: HotelBooking[] }>("/api/hotel/bookings").then(data => { setBookings(data.bookings); setMessage(""); }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load stays."));
  useEffect(() => { load(); }, []);
  const advance = async (booking: HotelBooking) => { const status = hotelNext[booking.booking.status as keyof typeof hotelNext]; if (!status) return; try { await requestJson(`/api/hotel/bookings/${booking.booking.id}`, { method: "PATCH", body: JSON.stringify({ status }) }); load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update stay."); } };
  return <section className="operations-records"><p className="eyebrow">Property stays</p>{message && <p className="operations-notice">{message}</p>}{bookings.map(({ booking, property, room }) => <article key={booking.id}><div><strong>{booking.guestName} · {property.name}</strong><span>{booking.checkInDate} to {booking.checkOutDate}{room ? ` · ${room.name}` : ""}</span></div><div><em>{booking.status.replace("_", " ")}</em>{hotelNext[booking.status as keyof typeof hotelNext] && <button onClick={() => advance({ booking, property, room })}>Mark {hotelNext[booking.status as keyof typeof hotelNext].replace("_", " ")}</button>}</div></article>)}{!message && !bookings.length && <p className="operations-notice">No stays are available for your linked properties.</p>}</section>;
}

export function HotelPropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]); const [rooms, setRooms] = useState<Room[]>([]); const [message, setMessage] = useState("Loading property details…"); const [name, setName] = useState(""); const [destination, setDestination] = useState(""); const [city, setCity] = useState(""); const [roomName, setRoomName] = useState(""); const [category, setCategory] = useState(""); const [inventory, setInventory] = useState("1");
  const load = () => Promise.all([requestJson<{ properties: Property[] }>("/api/hotel/property"), requestJson<{ rooms: Room[] }>("/api/hotel/rooms")]).then(([propertyData, roomData]) => { setProperties(propertyData.properties); setRooms(roomData.rooms); const primary = propertyData.properties[0]?.property; if (primary) { setName(primary.name); setDestination(primary.destination); setCity(primary.city); } setMessage(""); }).catch(error => setMessage(error instanceof Error ? error.message : "Unable to load property."));
  useEffect(() => { load(); }, []);
  const saveProperty = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); try { await requestJson("/api/hotel/property", { method: "PUT", body: JSON.stringify({ propertyId: properties[0]?.property.id, name, destination, city }) }); setMessage("Property saved."); load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save property."); } };
  const addRoom = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const propertyId = properties[0]?.property.id; if (!propertyId) return setMessage("Save a property before adding rooms."); try { await requestJson("/api/hotel/rooms", { method: "POST", body: JSON.stringify({ propertyId, name: roomName, category, inventory: Number(inventory) }) }); setRoomName(""); setCategory(""); setInventory("1"); setMessage("Room added."); load(); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add room."); } };
  return <div className="operations-manager"><form className="operations-form" onSubmit={saveProperty}><label>Property name<input required value={name} onChange={event => setName(event.target.value)} /></label><label>Destination<input required value={destination} onChange={event => setDestination(event.target.value)} /></label><label>City<input required value={city} onChange={event => setCity(event.target.value)} /></label><button className="button button-primary" type="submit">Save property</button></form><form className="operations-form" onSubmit={addRoom}><h2>Rooms</h2><label>Room name<input required value={roomName} onChange={event => setRoomName(event.target.value)} /></label><label>Category<input required value={category} onChange={event => setCategory(event.target.value)} /></label><label>Inventory<input required min="1" type="number" value={inventory} onChange={event => setInventory(event.target.value)} /></label><button className="button button-secondary" type="submit">Add room</button></form>{rooms.length > 0 && <section className="operations-records">{rooms.map(room => <article key={room.id}><div><strong>{room.name}</strong><span>{room.category}</span></div><em>{room.inventory} available</em></article>)}</section>}{message && <p className="operations-notice">{message}</p>}</div>;
}
