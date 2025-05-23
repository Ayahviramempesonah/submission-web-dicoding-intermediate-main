export default class AboutPage {
  async render() {
    return `
      <section class="container-about">
        
        <p id="nama">Nama: </p>
        <p id="profesi">Profesi: </p>
        <p id="deskripsi">Deskripsi: </p>
      </section>
    `;
  }

  async afterRender() {
    const namaElement = document.getElementById('nama');
    const profesiElement = document.getElementById('profesi');
    const deskripsiElement = document.getElementById('deskripsi');

    namaElement.innerText = 'Nama: CoderTamvan';
    profesiElement.innerText = 'Profesi: Driver Gojek';
    deskripsiElement.innerText =
      'Deskripsi: Saya adalah seorang driver Gojek yang bercita-cita menjadi pengembang web. Saya memiliki minat yang besar dalam teknologi dan pengembangan web, serta berharap dapat mengembangkan kemampuan saya dalam membuat aplikasi web yang inovatif dan bermanfaat bagi masyarakat.';
  }
}
