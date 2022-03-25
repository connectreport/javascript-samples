/* ==============================
Server connection configuration
=============================== */

// The URL you use to access your ConnectReport server,
// e.g. https://connectreport.acmecorp.com
const BASE_URL = "SET_BASE_URL";

// API key and base path of the client
// See https://connectreport.com/support/authentication/
const API_KEY = "SET_API_KEY_HERE";


/* ==============================
Report specific configuration
=============================== */

// The ID of the base template to use to generate the final report
const BASE_TEMPLATE_ID = "SET_BASE_TEMPLATE_ID_HERE";
// The final title of the report
const REPORT_TITLE = "My Report";


const client = new ConnectReport({
  apiKey: API_KEY,
  basePath: BASE_URL

});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pollReportTaskCompleted = async (id) => {
  // Poll for generated reports, looking for the one resulting from our task
  const results = await client.reports.getReports(1, undefined, id);
  if (results.data.reports.length > 0) {
    const result2 = await client.reports.getReport(results.data.reports[0].id);
    return result2.data;
  }
  await sleep(1000);
  return pollReportTaskCompleted();
};

const pollReportRendered = async (id) => {
  const { data } = await client.jobs.getJob(id);
  if (data.status === "complete") {
    return data;
  } else if (data.status === "err") {
    throw new Error(data.error);
  } else if (data.status === "pending") {
    await sleep(1000);
    return pollReportRendered(id);
  }
};

const main = async () => {
  // Create a template from the base template
  const template = await client.baseTemplates.duplicateBaseTemplate(
    BASE_TEMPLATE_ID
  );

  // Create the report task
  const reportTask = await client.reportTasks.createReportTask({
    templateId: template.data.id,
    at: new Date().toISOString(),
    enabled: true,
    frequency: "Once - now",
    title: REPORT_TITLE,
  });

  // Poll for the report task to complete
  // The returned entity is a "report" (generated report)
  const generatedReport = await pollReportTaskCompleted(reportTask.data.id);

  // Render the generated report to a PDF
  const response = await client.reports.renderReport(generatedReport.id, "pdf");
  const result = await pollReportRendered(response.data.jobId);

  // Open the PDF. Your browser will automatically have a cookie session at this point
  // as a result of previous API calls.  
  window.open(`${BASE_URL}/api/v1/${result.data.location}?attachmentName=${REPORT_TITLE}.pdf`);
};

