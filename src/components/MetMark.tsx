type Props = {
  width: number;
  height: number;
  /** Fill for the M. Pins are always gold. */
  color?: string;
  label?: string;
};

export const M_PATH =
  "M360 360H527V1240H360Z M423 423V1177H464V423Z M1073 360H1240V1240H1073Z M1136 423V1177H1177V423Z M605 360H995L800 1135Z M686 423L800 876L914 423Z M578 465L774 1240H578Z M641 975V1177H692Z M1022 465L826 1240H1022Z M959 975L908 1177H959Z";
export const PINS_PATH =
  "M263 475H360V538H263Z M263 768H360V831H263Z M263 1062H360V1125H263Z M1240 475H1337V538H1240Z M1240 768H1337V831H1240Z M1240 1062H1337V1125H1240Z";

/** The MET logo mark: an M with gold pins. */
export default function MetMark({ width, height, color = "#fff", label }: Props) {
  return (
    <svg
      viewBox="263 360 1074 880"
      width={width}
      height={height}
      style={{ display: "block" }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path fill={color} fillRule="evenodd" d={M_PATH} />
      <path fill="var(--gold)" d={PINS_PATH} />
    </svg>
  );
}
