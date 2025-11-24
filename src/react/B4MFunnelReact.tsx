import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import B4MFunnel, { WidgetMountOptions } from "../core/B4MFunnel";

export interface B4MFunnelReactProps
  extends Omit<WidgetMountOptions, "partnerId"> {
  partnerId: string;
  className?: string;
  style?: CSSProperties;
}

export const B4MFunnelReact = ({
  partnerId,
  locale,
  srcBase,
  allow,
  minHeight,
  email,
  sidebar,
  className,
  style,
}: B4MFunnelReactProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<B4MFunnel | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (!widgetRef.current) {
      widgetRef.current = new B4MFunnel();
    }

    widgetRef.current.mount(container, {
      partnerId,
      locale,
      srcBase,
      allow,
      minHeight,
      email,
      sidebar,
    });

    return () => {
      widgetRef.current?.unmount();
    };
  }, [partnerId, locale, srcBase, allow, minHeight, email, sidebar]);

  return <div ref={containerRef} className={className} style={style} />;
};

export default B4MFunnelReact;
