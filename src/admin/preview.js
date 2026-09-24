if (window.CMS) {
  const h = window.h;

  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  function diaMes(dateISO) {
    if (!dateISO) return "";
    const [, month, day] = String(dateISO).split("-").map(Number);
    if (!month) return dateISO;
    return `${day} ${MONTHS[month - 1]}`;
  }

  function toJS(value) {
    return value && typeof value.toJS === "function" ? value.toJS() : value;
  }

  CMS.registerPreviewStyle("https://fonts.googleapis.com/css2?family=Anton+SC&display=swap");

  CMS.registerPreviewTemplate("shows", function ({ widgetsFor }) {
    const items = toJS(widgetsFor("shows")) || [];

    const containerStyle = {
      margin: 0,
      padding: "20px",
      background: "#000",
      color: "#fff",
      fontFamily: "Martian Mono, monospace",
    };
    const listStyle = {
      display: "grid",
      gap: "16px",
      maxWidth: "768px",
      margin: "0 auto",
      listStyle: "none",
    };
    const cardStyle = {
      background: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "6px",
      padding: "32px 48px",
    };
    const headerStyle = {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      borderBottom: "1px solid #27272a",
      paddingBottom: "32px",
    };
    const titleBlockStyle = { display: "flex", flexDirection: "column", gap: "12px" };
    const dateStyle = {
      fontFamily: "'Anton SC', sans-serif",
      fontSize: "60px",
      lineHeight: 1,
      color: "#990000",
      textTransform: "uppercase",
    };
    const cityStyle = {
      fontFamily: "'Anton SC', sans-serif",
      fontSize: "24px",
      textTransform: "uppercase",
      margin: 0,
    };
    const venueStyle = { display: "flex", gap: "16px", fontSize: "14px", color: "#a1a1aa" };
    const venueLabelStyle = { color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap" };

    if (!items.length) {
      return h(
        "div",
        { style: containerStyle },
        h(
          "p",
          { style: { color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.2em" } },
          "Em breve divulgaremos novas datas"
        )
      );
    }

    const cards = items.map(function (item, idx) {
      const data = item.data || {};
      return h(
        "li",
        { key: idx, style: cardStyle },
        h(
          "div",
          { style: headerStyle },
          h(
            "div",
            { style: titleBlockStyle },
            h("div", { style: dateStyle }, diaMes(data.date)),
            h("h4", { style: cityStyle }, data.city || "")
          ),
          data.venue
            ? h(
                "div",
                { style: venueStyle },
                h("span", { style: venueLabelStyle }, "Local:"),
                h("span", null, data.venue)
              )
            : null
        )
      );
    });

    return h(
      "div",
      { style: containerStyle },
      h("ul", { style: listStyle }, cards)
    );
  });

  CMS.registerPreviewTemplate("photos", function ({ entry, getAsset }) {
    const list = entry.getIn(["data", "photos"]);
    const items = [];
    if (list && list.size) {
      for (let i = 0; i < list.size; i++) {
        items.push({ file: list.getIn([i, "file"]) || "" });
      }
    }

    function imageUrl(value) {
      if (!value) return "";
      try {
        const asset = getAsset(value);
        if (asset && asset.toString()) return asset.toString();
      } catch (e) {}
      let v = String(value);
      if (/^https?:\/\//.test(v) || v.charAt(0) === "/") return v;
      v = v.replace(/^\.\//, "");
      return v.startsWith("gallery/") ? "/" + v : "/gallery/" + v;
    }

    const containerStyle = { margin: 0, padding: "20px", background: "#000" };
    const gridStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "16px",
      maxWidth: "960px",
      margin: "0 auto",
    };
    const tileStyle = {
      aspectRatio: "1 / 1",
      overflow: "hidden",
      borderRadius: "6px",
      border: "1px solid #27272a",
      background: "#18181b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
    const imgStyle = { width: "100%", height: "100%", objectFit: "cover" };

    if (!items.length) {
      return h(
        "div",
        { style: containerStyle },
        h(
          "p",
          { style: { color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.2em" } },
          "Nenhuma foto na galeria"
        )
      );
    }

    const photos = items.map(function (item, idx) {
      const url = imageUrl(item.file);
      return h(
        "div",
        { key: idx, style: tileStyle },
        url ? h("img", { src: url, alt: "Foto " + (idx + 1), style: imgStyle }) : null
      );
    });

    return h(
      "div",
      { style: containerStyle },
      h("div", { style: gridStyle }, photos)
    );
  });
}