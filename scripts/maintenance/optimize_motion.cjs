const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'import { motion, AnimatePresence } from "motion/react";',
  'import { m, AnimatePresence, LazyMotion, domAnimation } from "motion/react";'
);

content = content.replace(/<motion\.div/g, '<m.div');
content = content.replace(/<\/motion\.div/g, '</m.div');

content = content.replace(
  'return (',
  'return (\n    <LazyMotion features={domAnimation}>'
);

content = content.replace(
  '      </AnimatePresence>\n    </div>',
  '      </AnimatePresence>\n    </LazyMotion>\n    </div>'
);

fs.writeFileSync('src/App.tsx', content);
