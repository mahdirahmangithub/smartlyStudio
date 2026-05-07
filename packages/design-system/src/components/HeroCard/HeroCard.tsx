import { forwardRef, type ReactNode } from "react";
import {
  Card,
  CardMedia,
  CardMediaContent,
  CardContent,
  CardBody,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../Card";
import type {
  CardMediaContentProps,
  CardMediaContentType,
  CardFooterProps,
} from "../Card";
import type { ImageryAspectRatio } from "../Imagery";
import type { BodyTextSize } from "../BodyText";

export type HeroCardSize = "sm" | "lg";

export interface HeroCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "children"> {
  /** sm = inset + density sm, lg = no inset + density lg + footer */
  size?: HeroCardSize;
  /** CardMediaContent type */
  mediaType?: CardMediaContentType;
  /** Aspect ratio for the media content */
  aspectRatio?: ImageryAspectRatio;
  /** Width of the media section in the horizontal layout (e.g. "50%", "300px") */
  mediaWidth?: string | number;
  /** Content rendered inside CardMediaContent */
  children?: ReactNode;
  /** Card title text */
  title?: string;
  /** Leading element for CardTitle */
  titleLeading?: ReactNode;
  /** Trailing slot for CardTitle */
  titleTrailing?: ReactNode;
  /** Description text rendered below the title */
  description?: string;
  /** Override description BodyText size */
  descriptionSize?: BodyTextSize;
  /** Footer props — only rendered when size="lg" */
  footer?: CardFooterProps;
}

export const HeroCard = forwardRef<HTMLElement, HeroCardProps>(
  function HeroCard(
    {
      size = "sm",
      mediaType = "image",
      aspectRatio = "16:9",
      mediaWidth = "50%",
      children,
      title,
      titleLeading,
      titleTrailing,
      description,
      descriptionSize,
      footer,
      ...rest
    },
    ref,
  ) {
    const isLg = size === "lg";

    return (
      <Card
        ref={ref}
        variant="elevated"
        density={isLg ? "lg" : "sm"}
        radius="lg"
        layout="horizontal-trailing"
        inset={isLg ? false : true}
        {...rest}
      >
        {children && (
          <CardMedia width={mediaWidth}>
            <CardMediaContent
              {...{ type: mediaType, aspectRatio, children } as CardMediaContentProps}
            />
          </CardMedia>
        )}

        <CardContent>
          <CardBody>
            {title && (
              <CardTitle
                size="lg"
                title={title}
                leading={titleLeading}
                trailing={titleTrailing}
              />
            )}
            {description && (
              <CardDescription size={descriptionSize}>
                {description}
              </CardDescription>
            )}
          </CardBody>
          {isLg && footer && <CardFooter {...footer} />}
        </CardContent>
      </Card>
    );
  },
);

HeroCard.displayName = "HeroCard";
