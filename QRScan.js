/* DISCLAIMER:
   Credits to Louis Merlin as this file was forked from
   https://github.com/louismerlin/qrscan
   in order to customize the source code for our own needs and to
   fix some bugs that were present on the original repo.
   Because of this, we will not include this file in our test cases.
*/
import React, { Component } from 'react';
import jsQR from 'jsqr';
import i18n from '../../../both/i18n';

const { requestAnimationFrame } = global;

class QRScan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notEnabled: true,
      loading: true,
      video: null,
    };
  }

  componentDidMount() {
    const video = document.createElement('video');
    const canvasElement = document.getElementById('qrCanvas');
    const canvas = canvasElement.getContext('2d');

    this.setState({ video });

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        video.srcObject = stream;
        video.setAttribute('playsinline', true);
        video.play();
        requestAnimationFrame(tick);
      });

    const tick = () => {
      if (this.state.notEnabled) this.setState({ notEnabled: false });
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (this.state.loading) this.setState({ loading: false });
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth * 0.7375;
        canvas.drawImage(
          video,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var imageData = canvas.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          this.props.onFind(code.data);
        }
      }
      requestAnimationFrame(tick);
    };
  }

  componentWillUnmount() {
    //this.state.video.pause();
    this.state.video.srcObject.getVideoTracks()[0].stop();
    this.setState({ video: null });
    this.setState({ loading: false });
    this.setState({ notEnabled: true });
  }

  render() {
    let message;
    if (this.state.notEnabled) {
      message = (
        <div>
          <span role='img' aria-label='camera'>
            🎥
          </span>{' '}
          {i18n.t('terminal.unableCamera')}
        </div>
      );
    } else if (this.state.loading) {
      message = (
        <div>
          <span role='img' aria-label='time'>
            ⌛
          </span>{' '}
          {i18n.t('terminal.tryingCamera')}
        </div>
      );
    }

    return (
      <div>
        {message}
        <canvas id='qrCanvas' />
      </div>
    );
  }
}

export default QRScan;
