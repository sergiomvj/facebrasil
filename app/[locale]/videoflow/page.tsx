export default function VideoFlowPage() {
  return (
    <iframe
      src="/fbrapps/video/videoflow.html"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        border: "none",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        zIndex: 9999,
      }}
      title="VideoFlow — Conceito Geral do Projeto"
    />
  );
}
