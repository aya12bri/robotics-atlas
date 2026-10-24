// add-meta.mjs — adds the search and share tags (description, canonical, Open Graph, Twitter card, favicon) to every page,
// and writes sitemap.xml and robots.txt. Idempotent: run it after the build scripts (they rewrite the pages).
//   node tools/add-meta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://roboticsatlas.ayabriksine.com', NAME = 'Robotics Atlas', IMG = SITE + '/og-image.jpg';
const DESC = {
  'learn.html': 'Twelve short robotics lessons: joints, frames, DH tables, kinematics, control and AI, each with a question and live 3D examples.',
  'learn-maths.html': 'A 2-axis arm from zero: angles, the DH table and the laws of motion, step by step with interactive examples.',
  'learn-model.html': 'The full course on robot modelling: frames, DH and DHM parameters, forward and inverse kinematics, with a live 3D arm.',
  'learn-singularities.html': 'Singularities and the Jacobian explained with a live robot: why some poses lose motion and how robots avoid them.',
  'learn-control.html': 'Dynamics, actuators and control of robot arms: torque, motors, PID loops and trajectories, with interactive examples.',
  'learn-intelligence.html': 'How robots perceive, plan and decide: sensors, vision, path planning and AI, explained step by step.',
  'learn-world.html': 'Robots in the real world: where industrial, collaborative, mobile and humanoid robots are used, and how to choose one.',
  'arm.html': 'Interactive 3D model of a 3-DOF robot arm: move each joint, see the kinematic diagram, the DH table and the Jacobian.',
  'gantry.html': 'Interactive 3D Cartesian gantry robot with three sliding axes: kinematics, workspace and pick and place.',
  'scara.html': 'Interactive 3D SCARA robot: closed-form inverse kinematics, DH table and a pick-and-place demo.',
  'articulated.html': 'Interactive 3D model of a 6-axis industrial robot with a spherical wrist: DH tables, inverse kinematics and pick and place.',
  'cobot.html': 'Interactive 3D model of a UR5-style collaborative robot: real parameters, offset wrist, force limiting and pick and place.',
  'delta.html': 'Interactive 3D Delta (parallel) robot: three arms and parallelograms, inverse kinematics and a fast pick-and-place demo.',
  'mobile.html': 'Interactive 3D differential-drive mobile robot: wheel speeds, turning circle, odometry and programs you can run.',
  'wheels.html': 'Mobile robot wheels and drives: fixed, castor, omni, Mecanum and ball wheels, drive layouts, sensors and a simulator.',
  'anatomy.html': 'Look inside a 6-axis industrial robot in 3D: joints, motors, gearboxes, controller and cables, with an X-ray mode.',
  'anatomy-scara.html': '3D anatomy of a SCARA robot: its joints, motors, gearboxes and controller, with an X-ray mode.',
  'anatomy-cobot.html': '3D anatomy of a collaborative robot: joints, motors, brakes, sensors and controller, with an X-ray mode.',
  'anatomy-delta.html': '3D anatomy of a Delta robot: motors, arms, parallelograms and the platform, with an X-ray mode.',
  'anatomy-gantry.html': '3D anatomy of a Cartesian gantry: rails, belts, motors and the end effector, with an X-ray mode.',
  'anatomy-mobile.html': '3D anatomy of a differential-drive mobile robot: wheels, motors, battery, sensors and controller, with an X-ray mode.',
  'anatomy-wheels.html': '3D anatomy of seven wheel types: fixed, castor, steered, omni, Mecanum, ball and track, with an X-ray mode.',
  'anatomy-drives.html': '3D anatomy of eight drive layouts for mobile robots: differential, Ackermann, omni, Mecanum and more.',
  'anatomy-stewart.html': '3D anatomy of a Stewart platform: six legs, actuators and joints, with an X-ray mode.',
  'anatomy-quadrotor.html': '3D anatomy of a quadrotor drone that really flies: motors, ESC, flight controller, battery and sensors, with an X-ray mode.',
  'anatomy-humanoid.html': '3D anatomy of a humanoid robot that really walks: gait, leg kinematics, balance, actuators and battery, with an X-ray mode.'
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html') && f !== '404.html').sort();
const url = (f) => (f === 'index.html' ? SITE + '/' : SITE + '/' + f.replace(/\.html$/, ''));
for (const f of pages) {
  const file = path.join(root, f); let h = fs.readFileSync(file, 'utf8');
  h = h.replace(/ *<!-- seo -->[\s\S]*?<!-- \/seo -->\n/, '');
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; if (!title) { console.log('no title:', f); continue; }
  const own = h.match(/<meta name="description" content="([^"]*)"/), desc = own ? own[1] : DESC[f]; if (!desc) { console.log('no description:', f); continue; }
  const tags = [
    own ? null : `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${url(f)}" />`,
    /rel="icon"/.test(h) ? null : '<link rel="icon" type="image/svg+xml" href="/logo.svg" />',
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`, `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url(f)}" />`, `<meta property="og:image" content="${IMG}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`
  ].filter(Boolean);
  h = h.replace(/(<title>[^<]*<\/title>\n)/, `$1    <!-- seo -->\n${tags.map((t) => '    ' + t + '\n').join('')}    <!-- /seo -->\n`);
  fs.writeFileSync(file, h);
}
const urls = pages.map((f) => `  <url><loc>${url(f)}</loc></url>`).join('\n');
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('pages', pages.length);
