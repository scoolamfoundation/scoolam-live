/**
 * OpenTelemetry API re-export shim.
 *
 * better-auth/core wraps every DB call in `withSpan`, which calls
 * `trace.getTracer(...)` and `SpanStatusCode.ERROR`. Under Next.js's server
 * runtime the dynamic `import("@opentelemetry/api")` resolves to a CJS
 * namespace whose named exports (`trace`, `SpanStatusCode`) are `undefined`,
 * crashing auth. We alias the package to the CommonJS build (which Node can
 * resolve reliably) and re-export its full surface as ESM named exports.
 */
const otel = require('@opentelemetry/api');

export const trace = otel.trace;
export const SpanStatusCode = otel.SpanStatusCode;
export const context = otel.context;
export const diag = otel.diag;
export const metrics = otel.metrics;
export const propagation = otel.propagation;
export const baggageEntryMetadataFromString = otel.baggageEntryMetadataFromString;
export const createContextKey = otel.createContextKey;
export const ROOT_CONTEXT = otel.ROOT_CONTEXT;
export const DiagConsoleLogger = otel.DiagConsoleLogger;
export const DiagLogLevel = otel.DiagLogLevel;
export const createNoopMeter = otel.createNoopMeter;
export const ValueType = otel.ValueType;
export const defaultTextMapGetter = otel.defaultTextMapGetter;
export const defaultTextMapSetter = otel.defaultTextMapSetter;
export const ProxyTracer = otel.ProxyTracer;
export const ProxyTracerProvider = otel.ProxyTracerProvider;
export const SamplingDecision = otel.SamplingDecision;
export const SpanKind = otel.SpanKind;
export const TraceFlags = otel.TraceFlags;
export const createTraceState = otel.createTraceState;
export const isSpanContextValid = otel.isSpanContextValid;
export const isValidTraceId = otel.isValidTraceId;
export const isValidSpanId = otel.isValidSpanId;
export const INVALID_SPANID = otel.INVALID_SPANID;
export const INVALID_TRACEID = otel.INVALID_TRACEID;
export const INVALID_SPAN_CONTEXT = otel.INVALID_SPAN_CONTEXT;

export default otel;
