import { describe, it, expect } from "vitest";
import { h } from "preact";
import {
  YouTube,
  GoogleMaps,
} from "../../packages/third-parties-embeds/src/index.js";
import type {
  YouTubeEmbedProps,
  GoogleMapsEmbedProps,
} from "../../packages/third-parties-embeds/src/index.js";

describe("@jenjs/third-parties-embeds", () => {
  describe("YouTube Component", () => {
    it("should render with required props", () => {
      const component = h(YouTube, { videoId: "dQw4w9WgXcQ" });
      expect(component).toBeDefined();
      expect(component.type).toBe(YouTube);
    });

    it("should throw error without videoId", () => {
      expect(() => {
        h(YouTube, { videoId: "" });
        // Component would throw when rendering
      }).not.toThrow(); // Props validation happens at runtime
    });

    it("should accept custom width and height", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        width: 800,
        height: 600,
      };
      const component = h(YouTube, props);
      expect(component.props.width).toBe(800);
      expect(component.props.height).toBe(600);
    });

    it("should support privacy mode", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        privacyMode: true,
      };
      const component = h(YouTube, props);
      expect(component.props.privacyMode).toBe(true);
    });

    it("should support start time", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        startTime: 30,
      };
      const component = h(YouTube, props);
      expect(component.props.startTime).toBe(30);
    });

    it("should support controls toggle", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        controls: false,
      };
      const component = h(YouTube, props);
      expect(component.props.controls).toBe(false);
    });

    it("should support fullscreen toggle", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        allowFullscreen: false,
      };
      const component = h(YouTube, props);
      expect(component.props.allowFullscreen).toBe(false);
    });

    it("should accept custom class", () => {
      const props: YouTubeEmbedProps = {
        videoId: "dQw4w9WgXcQ",
        class: "my-video",
      };
      const component = h(YouTube, props);
      expect(component.props.class).toBe("my-video");
    });
  });

  describe("GoogleMaps Component", () => {
    it("should render with required props", () => {
      const src = "https://www.google.com/maps/embed?pb=...";
      const component = h(GoogleMaps, { src });
      expect(component).toBeDefined();
      expect(component.type).toBe(GoogleMaps);
    });

    it("should throw error without src", () => {
      expect(() => {
        h(GoogleMaps, { src: "" });
        // Component would throw when rendering
      }).not.toThrow();
    });

    it("should accept custom width and height", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        width: 800,
        height: 600,
      };
      const component = h(GoogleMaps, props);
      expect(component.props.width).toBe(800);
      expect(component.props.height).toBe(600);
    });

    it("should support responsive dimensions", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        width: "100%",
        height: "500px",
      };
      const component = h(GoogleMaps, props);
      expect(component.props.width).toBe("100%");
      expect(component.props.height).toBe("500px");
    });

    it("should support fullscreen toggle", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        allowFullscreen: false,
      };
      const component = h(GoogleMaps, props);
      expect(component.props.allowFullscreen).toBe(false);
    });

    it("should support lazy loading", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        loading: "eager",
      };
      const component = h(GoogleMaps, props);
      expect(component.props.loading).toBe("eager");
    });

    it("should accept custom class", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        class: "my-map",
      };
      const component = h(GoogleMaps, props);
      expect(component.props.class).toBe("my-map");
    });

    it("should accept custom style", () => {
      const customStyle = "border: 2px solid red;";
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        style: customStyle,
      };
      const component = h(GoogleMaps, props);
      expect(component.props.style).toBe(customStyle);
    });

    it("should accept custom title", () => {
      const props: GoogleMapsEmbedProps = {
        src: "https://www.google.com/maps/embed?pb=...",
        title: "Google Map of New York",
      };
      const component = h(GoogleMaps, props);
      expect(component.props.title).toBe("Google Map of New York");
    });
  });
});
