import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/supabase-js';
import { useSession } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

interface VideoCallProps {
  patientId: number;
  veterinarianId: number;
}

const VideoCall: React.FC<VideoCallProps> = ({ patientId, veterinarianId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
      })
      .catch((error) => {
        console.error('Error getting user media:', error);
      });
  }, []);

  const handleCall = async () => {
    if (!localStream) return;

    setIsCalling(true);

    try {
      const { data, error } = await supabase
        .from('video_calls')
        .insert([
          {
            patient_id: patientId,
            veterinarian_id: veterinarianId,
            status: 'calling',
          },
        ]);

      if (error) {
        console.error('Error creating video call:', error);
        return;
      }

      const videoCallId = data[0].id;

      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Add local stream to peer connection
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Create an offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));

      // Send the offer to the server
      const { data: offerData, error: offerError } = await supabase
        .from('video_calls')
        .update({
          id: videoCallId,
          offer: offer,
        });

      if (offerError) {
        console.error('Error sending offer:', offerError);
        return;
      }

      // Wait for the answer
      const answer = await new Promise((resolve) => {
        const intervalId = setInterval(async () => {
          const { data: answerData, error: answerError } = await supabase
            .from('video_calls')
            .select('answer')
            .eq('id', videoCallId);

          if (answerError) {
            console.error('Error getting answer:', answerError);
            return;
          }

          if (answerData[0].answer) {
            resolve(answerData[0].answer);
            clearInterval(intervalId);
          }
        }, 1000);
      });

      // Set the remote description
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer }));

      // Add event listener for ice candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send the ice candidate to the server
          supabase
            .from('video_calls')
            .update({
              id: videoCallId,
              ice_candidates: event.candidate,
            });
        }
      };

      // Add event listener for track
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      setIsCalling(false);
    } catch (error) {
      console.error('Error making call:', error);
      setIsCalling(false);
    }
  };

  const handleHangUp = async () => {
    if (!localStream) return;

    try {
      const { data, error } = await supabase
        .from('video_calls')
        .update({
          status: 'ended',
        });

      if (error) {
        console.error('Error ending video call:', error);
        return;
      }

      setLocalStream(null);
      setRemoteStream(null);
    } catch (error) {
      console.error('Error hanging up:', error);
    }
  };

  return (
    <div>
      {isCalling ? (
        <button onClick={handleHangUp}>Hang Up</button>
      ) : (
        <button onClick={handleCall}>Call</button>
      )}
      {localStream && (
        <video
          srcObject={localStream}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%' }}
        />
      )}
      {remoteStream && (
        <video
          srcObject={remoteStream}
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
};

export default VideoCall;