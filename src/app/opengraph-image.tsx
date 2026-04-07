import { ImageResponse } from "next/og";
import { socialImageAlt, socialImageSize, SocialImage } from "@/lib/social-image";

export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<SocialImage />, {
    ...size,
  });
}
