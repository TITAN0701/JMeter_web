import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Path;
import org.apache.jmeter.control.LoopController;
import org.apache.jmeter.control.gui.LoopControlPanel;
import org.apache.jmeter.testelement.TestElement;
import org.apache.jmeter.threads.ThreadGroup;
import org.apache.jmeter.threads.gui.ThreadGroupGui;
import org.apache.jmeter.util.JMeterUtils;
import org.apache.jmeter.save.SaveService;
import org.apache.jorphan.collections.HashTree;
import org.apache.jmeter.testelement.TestPlan;

public class AddThreadGroup {
    private static TestPlan findTestPlan(HashTree tree) {
        for (Object key : tree.list()) {
            if (key instanceof TestPlan) {
                return (TestPlan) key;
            }
        }
        return null;
    }

    private static boolean hasThreadGroup(HashTree tree, String name) {
        for (Object key : tree.list()) {
            if (key instanceof ThreadGroup) {
                ThreadGroup tg = (ThreadGroup) key;
                if (name.equals(tg.getName())) {
                    return true;
                }
            }
        }
        return false;
    }

    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.out.println("Usage: AddThreadGroup <input.jmx> [output.jmx] [threadGroupName]");
            System.exit(1);
        }

        String inputPath = args[0];
        String outputPath = (args.length >= 2 && !args[1].isEmpty()) ? args[1] : inputPath;
        String tgName = (args.length >= 3 && !args[2].isEmpty()) ? args[2] : "New Thread Group";

        String jmeterHome = System.getenv("JMETER_HOME");
        if (jmeterHome == null || jmeterHome.isEmpty()) {
            jmeterHome = "C:\\Users\\suppo\\Desktop\\apache-jmeter-5.6.3\\apache-jmeter-5.6.3";
        }

        JMeterUtils.setJMeterHome(jmeterHome);
        JMeterUtils.loadJMeterProperties(jmeterHome + "\\bin\\jmeter.properties");
        JMeterUtils.initLocale();
        SaveService.loadProperties();

        File inputFile = new File(inputPath);
        HashTree tree = SaveService.loadTree(inputFile);
        {
            TestPlan testPlan = findTestPlan(tree);
            if (testPlan == null) {
                System.err.println("TestPlan not found in JMX.");
                System.exit(2);
            }

            LoopController loop = new LoopController();
            loop.setLoops(1);
            loop.setContinueForever(false);
            loop.setFirst(true);
            loop.setProperty(TestElement.GUI_CLASS, LoopControlPanel.class.getName());
            loop.setProperty(TestElement.TEST_CLASS, LoopController.class.getName());
            loop.initialize();

            ThreadGroup tg = new ThreadGroup();
            tg.setName(tgName);
            tg.setNumThreads(1);
            tg.setRampUp(1);
            tg.setScheduler(false);
            tg.setProperty(TestElement.GUI_CLASS, ThreadGroupGui.class.getName());
            tg.setProperty(TestElement.TEST_CLASS, ThreadGroup.class.getName());
            tg.setSamplerController(loop);

            HashTree testPlanTree = tree.get(testPlan);

            if (hasThreadGroup(testPlanTree, tgName)) {
                System.out.println("Thread Group already exists: " + tgName);
                System.out.println("Output: " + Path.of(outputPath).toAbsolutePath());
                return;
            }

            testPlanTree.add(tg);

            try (FileOutputStream fos = new FileOutputStream(new File(outputPath))) {
                SaveService.saveTree(tree, fos);
            }

            System.out.println("Added Thread Group: " + tgName);
            System.out.println("Output: " + Path.of(outputPath).toAbsolutePath());
        }
    }
}
