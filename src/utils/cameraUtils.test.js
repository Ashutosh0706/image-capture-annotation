
import { describe, it, expect, afterEach, vi } from "vitest";

import {
    isCameraSupported,
    getCameraErrorMessage,
} from "./cameraUtils";

describe("Camera Utility Tests", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("isCameraSupported", () => {
        it("should return true when getUserMedia is available", () => {
            vi.stubGlobal("navigator", {
                mediaDevices: {
                    getUserMedia: vi.fn(),
                },
            });

            expect(isCameraSupported()).toBe(true);
        });

        it("should return false when getUserMedia is unavailable", () => {
            vi.stubGlobal("navigator", {
                mediaDevices: {},
            });

            expect(isCameraSupported()).toBe(false);
        });
    });

    describe("getCameraErrorMessage", () => {
        it("should return permission denied message", () => {
            const error = { name: "NotAllowedError" };

            expect(getCameraErrorMessage(error)).toContain(
                "permission was denied"
            );
        });

        it("should return no camera found message", () => {
            const error = { name: "NotFoundError" };

            expect(getCameraErrorMessage(error)).toContain(
                "No camera was found"
            );
        });

        it("should return camera already in use message", () => {
            const error = { name: "NotReadableError" };

            expect(getCameraErrorMessage(error)).toContain(
                "currently being used"
            );
        });

        it("should return fallback message for unknown errors", () => {
            const error = { name: "UnknownError" };

            expect(getCameraErrorMessage(error)).toContain(
                "Unable to access the camera"
            );
        });

        it("should use the original error message when available", () => {
            const error = {
                name: "UnknownError",
                message: "Custom camera failure",
            };

            expect(getCameraErrorMessage(error)).toBe(
                "Custom camera failure"
            );
        });
    });
});
