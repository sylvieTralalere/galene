package codecs

import (
	"testing"

	"github.com/pion/rtp"
)

func TestVP8Keyframe(t *testing.T) {
	ps := [][]byte{
		{

			0x80, 0xe0, 0x71, 0x3e, 0x5d, 0x6f, 0x3c, 0xc5,
			0x75, 0xc, 0x80, 0x96, 0x90, 0x80, 0xb0, 0x4c,
			0x90, 0x2, 0x0, 0x9d, 0x1, 0x2a, 0x10, 0x0, 0x10,
			0x0, 0x39, 0x3, 0x0, 0x0, 0x1c, 0x22, 0x16, 0x16,
			0x22, 0x66, 0x12, 0x20, 0x4, 0x90, 0x40, 0x4e,
			0x9e, 0x8d, 0xe9, 0x40, 0xfe, 0xff, 0xab, 0x59,
			0x72, 0x30, 0xd1, 0xaf, 0xe4, 0x6a, 0x11, 0x3,
			0xfd, 0x15, 0xe9, 0x2, 0x2e, 0xdf, 0xd9, 0xd1,
			0xb8, 0x0, 0x0,
		},
		{
			0x80, 0x6f, 0x61, 0x8f, 0xd5, 0x36, 0xdc, 0x15,
			0x1b, 0x4a, 0xb5, 0x29, 0x78, 0x9, 0xa1, 0x93,
			0xa0, 0x5b, 0xd8, 0xf1, 0xde, 0x87, 0x23, 0x5a,
			0xb9, 0x19, 0x97, 0xb7, 0xbd, 0xbf, 0xf7, 0x6e,
			0xad, 0x82, 0xc4, 0x70, 0x1c, 0xc9, 0x3a, 0xb4,
			0x1f, 0x13, 0x45, 0xb5, 0xf1, 0x0, 0xa5, 0xa5,
			0xa9, 0xd0, 0xa5, 0xdf, 0x67, 0x88, 0x26, 0x30,
			0x32,
		},
	}

	var packet rtp.Packet

	for i, p := range ps {
		err := packet.Unmarshal(p)
		if err != nil {
			t.Errorf("Unmarshal(p%v): %v", i, err)
		}

		kf, kfKnown := Keyframe("video/vp8", &packet)
		if kf != (i == 0) || !kfKnown {
			t.Errorf("Keyframe(p%v): %v %v", i, kf, kfKnown)
		}
	}
}

func TestVP9Keyframe(t *testing.T) {
	ps := [][]byte{
		{
			0x80, 0xe2, 0x6c, 0xb9, 0xcd, 0xa2, 0x77, 0x5c,
			0xea, 0xf0, 0x14, 0xe9, 0x8f, 0xbd, 0x90, 0x18,
			0x0, 0x10, 0x0, 0x10, 0x1, 0x4, 0x1, 0x82, 0x49,
			0x83, 0x42, 0x0, 0x0, 0xf0, 0x0, 0xf4, 0x2, 0x38,
			0x24, 0x1c, 0x18, 0x10, 0x0, 0x0, 0x20, 0x40, 0x0,
			0x22, 0x9b, 0xff, 0xff, 0xd7, 0xe6, 0xc0, 0xa,
			0xf2, 0x32, 0xd4, 0xdd, 0xa3, 0x69, 0xc6, 0xca,
			0xd1, 0x50, 0xeb, 0x1c, 0x1, 0x50, 0x91, 0xf6,
			0x64, 0xc7, 0x35, 0xe9, 0x0, 0xfe, 0x76, 0xb2,
			0xb, 0x4d, 0xd7, 0x35, 0x23, 0xf3, 0x9f, 0x7f,
			0x86, 0x37, 0xb9, 0x65, 0x3a, 0xf9, 0x66, 0xa0,
			0x6a, 0xb2, 0x9b, 0xb3, 0x36, 0x5b, 0x47, 0xf2,
			0x26, 0x5c, 0xe2, 0x23, 0x4f, 0xff, 0xff, 0xff,
			0xfe, 0xc3, 0x49, 0x6b, 0x14, 0x58, 0x4d, 0xdc,
			0xd8, 0xf5, 0x76, 0x81, 0x2e, 0xb3, 0x7f, 0xff,
			0xfe, 0x18, 0xc8, 0xf8, 0x1b, 0xf6, 0xee, 0xc3,
			0xc, 0x6f, 0x23, 0x34, 0x80,
		},
		{
			0x80, 0xe2, 0x4a, 0xb5, 0x1a, 0x33, 0x3f, 0x7b,
			0x9c, 0xda, 0x7b, 0xd0, 0x8d, 0xec, 0x14, 0x86,
			0x0, 0x40, 0x92, 0x88, 0x2c, 0x50, 0x83, 0x30,
			0x10, 0x1c, 0x6, 0x3, 0x0, 0x82, 0x99, 0x15, 0xc8,
			0x0, 0x0, 0x0, 0x0, 0x18, 0x70, 0x0, 0x0, 0x4c,
			0x4, 0xa0,
		},
	}

	var packet rtp.Packet

	for i, p := range ps {
		err := packet.Unmarshal(p)
		if err != nil {
			t.Errorf("Unmarshal(p%v): %v", i, err)
		}

		kf, kfKnown := Keyframe("video/vp9", &packet)
		if kf != (i == 0) || !kfKnown {
			t.Errorf("Keyframe(p%v): %v %v", i, kf, kfKnown)
		}
	}
}

func TestH264Keyframe(t *testing.T) {
	ps := [][]byte{
		{
			0x80, 0xe6, 0xf, 0xae, 0xfa, 0x86, 0x3b, 0x49,
			0x59, 0xbd, 0x79, 0xe7, 0x78, 0x0, 0xc, 0x67,
			0x42, 0xc0, 0xc, 0x8c, 0x8d, 0x4e, 0x40, 0x3c,
			0x22, 0x11, 0xa8, 0x0, 0x4, 0x68, 0xce, 0x3c,
			0x80, 0x0, 0x1a, 0x65, 0xb8, 0x0, 0x4, 0x0, 0x0,
			0x9, 0xe3, 0x31, 0x40, 0x0, 0x46, 0x76, 0x38, 0x0,
			0x8, 0x2, 0x47, 0x0, 0x2, 0x7f, 0x3f, 0x77, 0x6f,
			0x67, 0x80,
		},
		{

			0x80, 0xe6, 0xf, 0xaf, 0xfa, 0x86, 0x46, 0x89,
			0x59, 0xbd, 0x79, 0xe7, 0x61, 0xe0, 0x0, 0x40,
			0x0, 0xbe, 0x40, 0x9e, 0xa0,
		},
	}

	var packet rtp.Packet

	for i, p := range ps {
		err := packet.Unmarshal(p)
		if err != nil {
			t.Errorf("Unmarshal(p%v): %v", i, err)
		}

		kf, kfKnown := Keyframe("video/h264", &packet)
		if kf != (i == 0) || !kfKnown {
			t.Errorf("Keyframe(p%v): %v %v", i, kf, kfKnown)
		}
	}
}

var vp8 = []byte{
	0x80, 0, 0, 42,
	0, 0, 0, 0,
	0, 0, 0, 0,

	0x90, 0x80, 0x80, 57,

	0, 0, 0, 0,
}

func TestPacketFlagsVP8(t *testing.T) {
	buf := append([]byte{}, vp8...)
	flags, err := PacketFlags("video/vp8", buf)
	if flags.Seqno != 42 || !flags.Start || flags.Pid != 57 ||
		flags.Sid != 0 || flags.Tid != 0 ||
		flags.TidUpSync || flags.Discardable || err != nil {
		t.Errorf("Got %v, %v, %v, %v, %v, %v (%v)",
			flags.Seqno, flags.Start, flags.Pid, flags.Sid,
			flags.TidUpSync, flags.Discardable, err,
		)
	}
}

func TestRewriteVP8(t *testing.T) {
	for i := uint16(0); i < 0x7fff; i++ {
		buf := append([]byte{}, vp8...)
		err := RewritePacket("video/vp8", buf, true, i, i)
		if err != nil {
			t.Errorf("rewrite: %v", err)
			continue
		}
		flags, err := PacketFlags("video/vp8", buf)
		if err != nil || flags.Seqno != i ||
			flags.Pid != (57+i)&0x7FFF || !flags.Marker {
			t.Errorf("Expected %v %v, got %v %v (%v)",
				i, (57+i)&0x7FFF,
				flags.Seqno, flags.Pid, err)
		}
	}
}

var vp9 = []byte{
	0x80, 0, 0, 42,
	0, 0, 0, 0,
	0, 0, 0, 0,

	0x88, 0x80, 57, 0,
}

func TestPacketFlagsVP9(t *testing.T) {
	buf := append([]byte{}, vp9...)
	flags, err := PacketFlags("video/vp9", buf)
	if flags.Seqno != 42 || !flags.Start || flags.Pid != 57 ||
		flags.Sid != 0 || flags.Tid != 0 ||
		flags.TidUpSync || flags.Discardable || err != nil {
		t.Errorf("Got %v, %v, %v, %v, %v, %v (%v)",
			flags.Seqno, flags.Start, flags.Pid, flags.Sid,
			flags.TidUpSync, flags.Discardable, err,
		)
	}
}

func TestRewriteVP9(t *testing.T) {
	for i := uint16(0); i < 0x7fff; i++ {
		buf := append([]byte{}, vp9...)
		err := RewritePacket("video/vp9", buf, true, i, i)
		if err != nil {
			t.Errorf("rewrite: %v", err)
			continue
		}
		flags, err := PacketFlags("video/vp9", buf)
		if err != nil || flags.Seqno != i ||
			flags.Pid != (57+i)&0x7FFF || !flags.Marker {
			t.Errorf("Expected %v %v, got %v %v (%v)",
				i, (57+i)&0x7FFF,
				flags.Seqno, flags.Pid, err)
		}
	}
}
