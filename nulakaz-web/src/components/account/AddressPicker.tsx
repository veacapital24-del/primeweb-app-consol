"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ADDRESS_EVENT,
  EMPTY_ADDRESS,
  MU_CENTER,
  clearDeliveryAddress,
  getDeliveryAddress,
  saveDeliveryAddress,
  type DeliveryAddress,
} from "@/lib/address-store";

// ---------------------------------------------------------------------------
// Google Maps typings are not shipped with next.js. We declare just what we
// actually use so the file still typechecks without @types/google.maps.
// ---------------------------------------------------------------------------
type LatLng = { lat: number; lng: number };
type GMap = {
  panTo: (c: LatLng) => void;
  setZoom: (z: number) => void;
  getCenter: () => { lat: () => number; lng: () => number };
};
type GMarker = {
  setPosition: (c: LatLng) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
  addListener: (ev: string, cb: () => void) => void;
};
type GGeocoder = {
  geocode: (
    req: { location?: LatLng; address?: string },
    cb: (results: unknown, status: string) => void,
  ) => void;
};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: unknown) => GMap;
        Marker: new (opts: unknown) => GMarker;
        Geocoder: new () => {
          geocode: (
            req: { location?: LatLng; address?: string },
            cb: (
              results: Array<{
                formatted_address: string;
                geometry: { location: { lat: () => number; lng: () => number } };
                address_components: Array<{
                  long_name: string;
                  short_name: string;
                  types: string[];
                }>;
              }> | null,
              status: string,
            ) => void,
          ) => void;
        };
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts: unknown,
          ) => {
            addListener: (ev: string, cb: () => void) => void;
            getPlace: () => {
              geometry?: {
                location?: { lat: () => number; lng: () => number };
              };
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
            };
          };
        };
        event: {
          addListenerOnce: (
            target: unknown,
            ev: string,
            cb: () => void,
          ) => void;
        };
      };
    };
    __gmapsLoader?: Promise<void>;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("not browser"));
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoader) return window.__gmapsLoader;
  if (!API_KEY) return Promise.reject(new Error("no-api-key"));

  window.__gmapsLoader = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=weekly`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(s);
  });
  return window.__gmapsLoader;
}

function extractComponents(
  components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>,
) {
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? "";
  const streetNumber = get("street_number");
  const route = get("route");
  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  return {
    street,
    village: get("locality") || get("sublocality") || get("neighborhood"),
    district:
      get("administrative_area_level_1") ||
      get("administrative_area_level_2"),
    country: get("country") || "Mauritius",
  };
}

export function AddressPicker() {
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [status, setStatus] = useState<
    "loading" | "ready" | "no-key" | "error"
  >("loading");
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<GMap | null>(null);
  const markerRef = useRef<GMarker | null>(null);
  const geocoderRef = useRef<GGeocoder | null>(null);

  const isEmpty = useMemo(
    () =>
      !address.street &&
      !address.village &&
      !address.landmark &&
      address.lat == null,
    [address],
  );

  // ---- Hydrate from localStorage on mount + listen for cross-tab changes --
  useEffect(() => {
    const load = () => {
      const saved = getDeliveryAddress();
      if (saved) setAddress(saved);
    };
    load();
    window.addEventListener(ADDRESS_EVENT, load);
    return () => window.removeEventListener(ADDRESS_EVENT, load);
  }, []);

  // ---- Load Google Maps script + init map --------------------------------
  useEffect(() => {
    if (!API_KEY) {
      setStatus("no-key");
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled) return;
        initMap();
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center the map when the saved address loads after map init
  useEffect(() => {
    if (status !== "ready") return;
    if (address.lat != null && address.lng != null) {
      const c = { lat: address.lat, lng: address.lng };
      mapRef.current?.panTo(c);
      mapRef.current?.setZoom(16);
      markerRef.current?.setPosition(c);
    }
  }, [status, address.lat, address.lng]);

  function initMap() {
    if (!window.google || !mapContainerRef.current) return;
    const center =
      address.lat != null && address.lng != null
        ? { lat: address.lat, lng: address.lng }
        : MU_CENTER;
    const zoom = address.lat != null ? 16 : 10;

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      mapTypeId: "roadmap",
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: false,
      gestureHandling: "greedy",
    });

    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: mapRef.current,
      draggable: true,
      title: "Drag to your delivery spot",
    });

    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current?.getPosition();
      if (!pos) return;
      const c = { lat: pos.lat(), lng: pos.lng() };
      reverseGeocode(c);
    });

    // Click map to move pin
    (
      mapRef.current as unknown as {
        addListener: (ev: string, cb: (e: unknown) => void) => void;
      }
    ).addListener("click", (e: unknown) => {
      const event = e as { latLng?: { lat: () => number; lng: () => number } };
      if (!event.latLng) return;
      const c = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      markerRef.current?.setPosition(c);
      reverseGeocode(c);
    });

    geocoderRef.current = new window.google.maps.Geocoder();

    if (searchInputRef.current) {
      const ac = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: ["mu"] },
          fields: ["geometry", "formatted_address", "address_components"],
        },
      );
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const loc = place.geometry?.location;
        if (!loc) return;
        const c = { lat: loc.lat(), lng: loc.lng() };
        mapRef.current?.panTo(c);
        mapRef.current?.setZoom(16);
        markerRef.current?.setPosition(c);
        const parts = place.address_components
          ? extractComponents(place.address_components)
          : {};
        setAddress((prev) => ({
          ...prev,
          street: (parts as { street?: string }).street || prev.street,
          village: (parts as { village?: string }).village || prev.village,
          district:
            (parts as { district?: string }).district || prev.district,
          country: (parts as { country?: string }).country || prev.country,
          lat: c.lat,
          lng: c.lng,
        }));
      });
    }
  }

  function reverseGeocode(c: LatLng) {
    if (!geocoderRef.current) {
      setAddress((prev) => ({ ...prev, lat: c.lat, lng: c.lng }));
      return;
    }
    geocoderRef.current.geocode(
      { location: c },
      (results: unknown, statusStr: string) => {
        const arr = results as Array<{
          formatted_address: string;
          address_components: Array<{
            long_name: string;
            short_name: string;
            types: string[];
          }>;
        }> | null;
        if (statusStr !== "OK" || !arr || arr.length === 0) {
          setAddress((prev) => ({ ...prev, lat: c.lat, lng: c.lng }));
          return;
        }
        const parts = extractComponents(arr[0].address_components);
        setAddress((prev) => ({
          ...prev,
          street: parts.street || prev.street,
          village: parts.village || prev.village,
          district: parts.district || prev.district,
          country: parts.country || prev.country,
          lat: c.lat,
          lng: c.lng,
        }));
      },
    );
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Your browser doesn't support geolocation.");
      return;
    }
    setGeoBusy(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.panTo(c);
        mapRef.current?.setZoom(17);
        markerRef.current?.setPosition(c);
        reverseGeocode(c);
        setGeoBusy(false);
      },
      (err) => {
        setGeoBusy(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable it in your browser settings."
            : err.code === err.POSITION_UNAVAILABLE
              ? "Couldn't determine your location."
              : "Couldn't get your location — please try again or drag the pin.";
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveDeliveryAddress(address);
    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 1800);
  }

  function handleClear() {
    clearDeliveryAddress();
    setAddress(EMPTY_ADDRESS);
    // Re-center map on Mauritius
    mapRef.current?.panTo(MU_CENTER);
    mapRef.current?.setZoom(10);
    markerRef.current?.setPosition(MU_CENTER);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Summary ribbon if an address is saved */}
      {address.savedAt > 0 && (
        <div className="flex items-center gap-2 bg-[#5a8a3d]/10 text-[#3f6828] text-[12px] font-semibold rounded-full px-3 py-1.5 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a3d]" />
          Saved on {new Date(address.savedAt).toLocaleDateString()}
        </div>
      )}

      {/* Map + search */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border space-y-3">
          <div>
            <label
              htmlFor="addr-search"
              className="block text-sm font-semibold text-foreground/80 mb-1.5"
            >
              Find your location
            </label>
            <input
              ref={searchInputRef}
              id="addr-search"
              type="search"
              placeholder={
                status === "ready"
                  ? "Search a street, village or landmark in Mauritius…"
                  : "Map is loading…"
              }
              disabled={status !== "ready"}
              className="w-full bg-background border border-border rounded-full h-11 px-4 text-sm focus:outline-none focus:border-brand transition-colors disabled:opacity-60"
            />
            <p className="mt-1.5 text-[12px] text-foreground-muted">
              Can&rsquo;t find it? Drag the pin on the map, or use{" "}
              <span className="font-semibold">📍 my current location</span>{" "}
              below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoBusy || status !== "ready"}
              className="inline-flex items-center gap-2 border border-brand text-brand rounded-full h-9 px-4 text-sm font-semibold hover:bg-brand hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {geoBusy ? "Locating…" : "Use my current location"}
            </button>
            {address.lat != null && address.lng != null && (
              <span className="text-[12px] text-foreground-muted font-mono">
                Pin: {address.lat.toFixed(5)}, {address.lng.toFixed(5)}
              </span>
            )}
          </div>

          {geoError && (
            <p
              role="alert"
              className="text-[12px] text-[#c43f3f] bg-[#c43f3f]/10 border border-[#c43f3f]/30 rounded-xl px-3 py-2"
            >
              {geoError}
            </p>
          )}
        </div>

        <div className="relative">
          {status === "no-key" ? (
            <MapKeyMissing />
          ) : status === "error" ? (
            <MapLoadError />
          ) : (
            <div
              ref={mapContainerRef}
              className="w-full h-[320px] sm:h-[400px] bg-background"
              aria-label="Delivery location map — drag pin to your delivery spot"
              role="application"
            />
          )}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-foreground-muted">
              Loading map…
            </div>
          )}
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 space-y-5">
        <h3 className="font-bold text-foreground">Delivery details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full name"
            value={address.fullName}
            onChange={(v) => setAddress({ ...address, fullName: v })}
            autoComplete="name"
          />
          <Field
            label="Phone"
            value={address.phone}
            onChange={(v) => setAddress({ ...address, phone: v })}
            type="tel"
            autoComplete="tel"
            placeholder="+230 5XXX XXXX"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Street / road"
            value={address.street}
            onChange={(v) => setAddress({ ...address, street: v })}
            placeholder="Auto-filled from the map"
          />
          <Field
            label="Village / town"
            value={address.village}
            onChange={(v) => setAddress({ ...address, village: v })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="District"
            value={address.district}
            onChange={(v) => setAddress({ ...address, district: v })}
          />
          <Field
            label="Landmark"
            value={address.landmark}
            onChange={(v) => setAddress({ ...address, landmark: v })}
            placeholder="e.g. opposite Winners, red gate"
          />
        </div>

        <div>
          <label
            htmlFor="addr-notes"
            className="block text-sm font-semibold text-foreground/80 mb-1.5"
          >
            Delivery notes{" "}
            <span className="text-foreground-muted font-normal">
              (for the driver)
            </span>
          </label>
          <textarea
            id="addr-notes"
            rows={3}
            value={address.notes}
            onChange={(e) => setAddress({ ...address, notes: e.target.value })}
            placeholder="e.g. Gate code, leave with the neighbour, call on arrival…"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isEmpty && !address.fullName}
          className={[
            "rounded-full h-11 px-8 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            saveState === "saved"
              ? "bg-[#5a8a3d] text-white"
              : "bg-brand text-white hover:bg-brand-dark",
          ].join(" ")}
        >
          {saveState === "saved"
            ? "Address saved ✓"
            : address.savedAt > 0
              ? "Update address"
              : "Save address"}
        </button>
        {address.savedAt > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-semibold text-foreground-muted hover:text-[#c43f3f] underline underline-offset-2"
          >
            Clear saved address
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const id = `addr-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground/80 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full bg-background border border-border rounded-full h-11 px-4 text-sm focus:outline-none focus:border-brand transition-colors"
      />
    </div>
  );
}

function MapKeyMissing() {
  return (
    <div className="w-full h-[320px] sm:h-[400px] bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-400/20 text-amber-700 flex items-center justify-center mb-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <p className="font-bold text-foreground mb-1">Map needs an API key</p>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Add your Google Maps key to{" "}
          <code className="text-[12px] bg-brand-soft/40 text-brand px-1.5 py-0.5 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          in <code>.env.local</code> and restart the dev server. The form below
          still works without the map.
        </p>
      </div>
    </div>
  );
}

function MapLoadError() {
  return (
    <div className="w-full h-[320px] sm:h-[400px] bg-background flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <p className="font-bold text-foreground mb-1">Map failed to load</p>
        <p className="text-sm text-foreground/70 leading-relaxed">
          Check your network connection or verify the Google Maps API key is
          valid. You can still enter your address manually below.
        </p>
      </div>
    </div>
  );
}
