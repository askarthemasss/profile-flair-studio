import React from "react";

type HeadingTag = "h1" | "h2" | "h3";

interface SectionTitleProps {
  children: React.ReactNode;
  kicker?: React.ReactNode;
  description?: React.ReactNode;
  as?: HeadingTag;
  size?: "page" | "section";
  align?: "left" | "center";
  className?: string;
  descriptionClassName?: string;
  id?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  kicker,
  description,
  as: Heading = "h2",
  size = "page",
  align = "left",
  className = "",
  descriptionClassName = "",
  id,
}) => {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`.trim()}>
      {kicker ? <p className="notebook-kicker mb-3">{kicker}</p> : null}
      <Heading
        id={id}
        className={[
          "section-title",
          size === "section" ? "section-title--sm" : "",
          align === "center" ? "section-title--center" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </Heading>
      {description ? (
        <p
          className={`notebook-lede mt-4 max-w-2xl text-[0.98rem] ${align === "center" ? "mx-auto" : ""} ${descriptionClassName}`.trim()}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};
