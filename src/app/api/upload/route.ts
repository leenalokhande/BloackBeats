import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileObj = file as File;
    const fileName = fileObj.name;
    const fileType = fileObj.type;

    // Validate allowed types: audio, JSON, and image
    const isAudio = fileType.startsWith("audio/");
    const isJson =
      fileType === "application/json" ||
      (fileType === "application/octet-stream" && fileName.endsWith(".json"));
    const isImage = fileType.startsWith("image/");

    if (!isAudio && !isJson && !isImage) {
      return NextResponse.json(
        { error: "Only audio, image, or JSON files are allowed" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const documentId = `${fileName}_${timestamp}`;

    const pinataData = new FormData();
    pinataData.append("file", file);
    pinataData.append("pinataMetadata", JSON.stringify({ name: documentId }));

    // Upload to Pinata
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Pinata error: ${JSON.stringify(errorData)}`);
    }

    const { IpfsHash } = await res.json();

    return NextResponse.json(
      {
        status: "success",
        ipfsHash: IpfsHash,
        fileName,
        documentId,
        fileType,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
